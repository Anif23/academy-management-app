import axios from 'axios';
import { httpClient, toErrorMessage } from './httpClient';
import type { UploadedFileRef } from '../types';

export type UploadFolder =
  | 'task-attachments'
  | 'submission-files'
  | 'student-photos'
  | 'course-images'
  | 'testimonial-photos'
  | 'misc';

/**
 * Uploads a file straight to S3 using a short-lived presigned URL — this
 * backend process never sees the file bytes. Falls back transparently to
 * the local-disk endpoint when the server reports S3 isn't configured
 * (e.g. a fresh dev checkout with no AWS account yet).
 */
export async function uploadFile(
  file: File,
  folder: UploadFolder,
  onProgress?: (percent: number) => void,
): Promise<UploadedFileRef> {
  try {
    const presign = await httpClient.post('/upload/presign', {
      folder,
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
    });

    const { uploadUrl, fileUrl, fileName, fileType, fileSize } = presign.data.data;

    try {
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': fileType },
        onUploadProgress: (event) => {
          if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100));
        },
      });
      return { url: fileUrl, fileName, fileType, fileSize };
    } catch (putError) {
      // Once S3 is configured, uploads go through S3 exclusively — no
      // silent fallback to local disk. A presign succeeding but the PUT
      // itself failing is almost always the bucket's CORS policy not
      // allowing this origin yet; surface that clearly instead of masking
      // it behind a second, confusing "use presign instead" error from
      // the local-upload endpoint rejecting the fallback attempt.
      throw new Error(
        "Upload to cloud storage failed. This almost always means the S3 bucket's CORS " +
          "configuration doesn't allow uploads from this website's origin yet — check the " +
          'bucket\'s CORS settings in the AWS console (AllowedMethods must include PUT, ' +
          'AllowedOrigins must include this site).',
      );
    }
  } catch (error: any) {
    if (error?.response?.data?.errorCode === 'S3_NOT_CONFIGURED') {
      // S3 isn't set up at all yet — local disk is the intended dev
      // fallback for exactly this case (not once S3 is actually configured).
      return uploadFileLocally(file, onProgress);
    }
    throw new Error(toErrorMessage(error));
  }
}

async function uploadFileLocally(file: File, onProgress?: (percent: number) => void): Promise<UploadedFileRef> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await httpClient.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });
  const { url, fileName, fileType, fileSize } = response.data.data;
  return { url, fileName, fileType, fileSize };
}

export async function uploadFiles(
  files: File[],
  folder: UploadFolder,
  onProgress?: (fileIndex: number, percent: number) => void,
): Promise<UploadedFileRef[]> {
  const results: UploadedFileRef[] = [];
  for (let i = 0; i < files.length; i++) {
    results.push(await uploadFile(files[i], folder, (percent) => onProgress?.(i, percent)));
  }
  return results;
}
