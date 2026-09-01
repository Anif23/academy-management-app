const express = require('express');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { loginLimiter } = require('../middleware/rateLimitMiddleware');
const { loginSchema, registerSchema, updateProfileSchema } = require('../validators/authValidators');

const router = express.Router();

router.post('/login', loginLimiter, validate({ body: loginSchema }), authController.login);
router.post('/register', loginLimiter, validate({ body: registerSchema }), authController.register);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);
router.patch('/me', requireAuth, validate({ body: updateProfileSchema }), authController.updateMe);

module.exports = router;
