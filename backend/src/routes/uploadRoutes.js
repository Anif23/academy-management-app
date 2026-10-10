const express = require('express');
const uploadController = require('../controllers/uploadController');
const { requireAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { presignUploadSchema } = require('../validators/uploadValidators');

const router = express.Router();

router.use(requireAuth);

// Preferred, production-ready path: get a presigned S3 URL, upload
// directly from the browser, then use the returned fileUrl elsewhere.
router.post('/presign', validate({ body: presignUploadSchema }), uploadController.presign);

// Legacy/local-dev fallback — only functions when S3 is not configured.
router.post('/', uploadController.localUpload.single('file'), uploadController.uploadFileLocally);

module.exports = router;
