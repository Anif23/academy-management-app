const express = require('express');
const searchController = require('../controllers/searchController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');

const router = express.Router();

router.use(requireAuth);
router.get('/', requirePermission('search:read'), searchController.search);

module.exports = router;
