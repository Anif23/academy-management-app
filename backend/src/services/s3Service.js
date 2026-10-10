const crypto = require('crypto');
const path = require('path');
const { S3Client, DeleteObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

/**
 * File storage, real-world scale version.
 *
 * Files never pass through this backend's memory or disk: the client asks
 * this service for a short-lived presigned URL, then PUTs the file bytes
 * straight to S3 from the browser. The backend only ever handles small
 * JSON (file name/type/size + the resulting object key/URL) — it never
 * buffers a multi-hundred-MB video, which is what actually breaks a
 * single-process Node server under load as an app like this grows.
 *
 * Everything below is behind `env.s3Configured`. If AWS isn't configured
 * (e.g. a fresh local dev checkout with no AWS account yet), callers fall
 * back to the local-disk multer path in uploadController so the app still
 * runs — see that file for the fallback.
 */

let client = null;
function getClient() {
  if (!env.s3Configured) {
    throw ApiError.badRequest(
      'File storage is not configured on the server (missing AWS_REGION / AWS_S3_BUCKET).',
      'S3_NOT_CONFIGURED',
    );
  }
  if (!client) {
    client = new S3Client({
      region: env.awsRegion,
      // If awsAccessKeyId/awsSecretAccessKey are blank, the SDK's default
      // credential provider chain still works (IAM role, shared config,
      // etc.) — this is only for the common "explicit .env keys" case.
      ...(env.awsAccessKeyId && env.awsSecretAccessKey
        ? { credentials: { accessKeyId: env.awsAccessKeyId, secretAccessKey: env.awsSecretAccessKey } }
        : {}),
    });
  }
  return client;
}

function publicUrlFor(key) {
  if (env.awsS3PublicBaseUrl) {
    return `${env.awsS3PublicBaseUrl.replace(/\/$/, '')}/${key}`;
  }
  return `https://${env.awsS3Bucket}.s3.${env.awsRegion}.amazonaws.com/${key}`;
}

function safeKeyFor(folder, originalName) {
  const ext = path.extname(originalName || '').slice(0, 10);
  const unique = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  return `${folder}/${unique}${ext}`;
}

/**
 * Returns a one-time presigned PUT URL the client uploads directly to,
 * plus the final public URL the object will have once uploaded.
 *
 * folder: logical bucket prefix, e.g. "task-submissions", "task-attachments",
 * "student-photos" — keeps objects organized and lets lifecycle/ACL rules
 * differ per folder later if needed.
 */
async function createUploadUrl({ folder, fileName, contentType }) {
  const key = safeKeyFor(folder, fileName);

  const command = new PutObjectCommand({
    Bucket: env.awsS3Bucket,
    Key: key,
    ContentType: contentType || 'application/octet-stream',
  });

  const uploadUrl = await getSignedUrl(getClient(), command, { expiresIn: 300 }); // 5 minutes

  return { uploadUrl, key, fileUrl: publicUrlFor(key) };
}

async function deleteObject(key) {
  if (!env.s3Configured || !key) return;
  try {
    await getClient().send(new DeleteObjectCommand({ Bucket: env.awsS3Bucket, Key: key }));
  } catch {
    // Best-effort cleanup — a failed delete of an orphaned object should
    // never block the user-facing operation (e.g. deleting a submission).
  }
}

/** Extracts the S3 object key back out of one of our own generated URLs. */
function keyFromUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/^\//, '');
  } catch {
    return null;
  }
}

module.exports = { createUploadUrl, deleteObject, keyFromUrl };
