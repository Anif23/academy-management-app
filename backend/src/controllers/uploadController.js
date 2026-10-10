const multer = require('multer');
const path = require('path');
const fs = require('fs');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const s3Service = require('../services/s3Service');

/**
 * Primary path (production / whenever AWS_REGION + AWS_S3_BUCKET are set):
 * client asks for a presigned URL, uploads directly to S3, then tells the
 * relevant resource (task submission, student photo, etc.) about the
 * resulting fileUrl. This backend process never touches the file bytes.
 */
const presign = asyncHandler(async (req, res) => {
  const maxBytes = env.maxUploadSizeMb * 1024 * 1024;
  if (req.body.fileSize > maxBytes) {
    throw ApiError.badRequest(`File exceeds the ${env.maxUploadSizeMb}MB upload limit.`, 'FILE_TOO_LARGE');
  }

  if (!env.s3Configured) {
    throw ApiError.badRequest(
      'Cloud storage is not configured on this server yet. Ask an administrator to set AWS_REGION and AWS_S3_BUCKET.',
      'S3_NOT_CONFIGURED',
    );
  }

  const { folder, fileName, fileType, fileSize } = req.body;
  const { uploadUrl, fileUrl, key } = await s3Service.createUploadUrl({ folder, fileName, contentType: fileType });

  res.json({
    success: true,
    data: { uploadUrl, fileUrl, key, fileName, fileType, fileSize },
  });
});

// --------------------------------------------------------------------------
// Local-disk fallback — only used when S3 isn't configured, so a fresh
// clone with no AWS account yet still has a working (if not
// production-scale) upload path during local development.
// --------------------------------------------------------------------------

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const localUpload = multer({ storage: localStorage, limits: { fileSize: 200 * 1024 * 1024 } });

const uploadFileLocally = (req, res) => {
  if (env.s3Configured) {
    throw ApiError.badRequest('Cloud storage is configured — use POST /upload/presign instead.', 'USE_PRESIGN');
  }
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    data: {
      url: fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    },
  });
};

module.exports = { presign, localUpload, uploadFileLocally };
