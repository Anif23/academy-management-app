const express = require('express');
const brandingController = require('../controllers/brandingController');

const router = express.Router();

// No requireAuth — the login screen needs this before anyone is signed in.
router.get('/', brandingController.getBranding);

module.exports = router;
