const express = require('express');
const { upload, uploadFile } = require('../controllers/uploadController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', requireAuth, upload.single('file'), uploadFile);

module.exports = router;
