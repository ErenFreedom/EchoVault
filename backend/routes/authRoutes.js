const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

// Route for initiating the login process
router.post('/login', authController.login);

// Route for verifying OTP as part of the login process
router.post('/verify-otp', authController.verifyOtpForLogin);

module.exports = router;
