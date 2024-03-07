const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

// Route to handle user login
router.post('/login', authController.login);

// Route to handle OTP verification for login
router.post('/verify-otp', authController.verifyOtpForLogin);

module.exports = router;
