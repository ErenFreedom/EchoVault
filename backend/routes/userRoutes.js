const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const authMiddleware = require('../middleware/authMiddleware'); // Make sure this path matches the location of your middleware

// Route for user registration doesn't require authentication
router.post('/register', userController.registerUser);

// Add routes for OTP-based email verification
router.post('/verify-otp', userController.verifyOtp); // For verifying the OTP
router.post('/resend-otp', userController.resendOtp); // For resending the OTP

// Following routes require the user to be logged in
router.patch('/update-profile', authMiddleware, userController.updateProfile);
router.patch('/toggle-theme', authMiddleware, userController.toggleTheme);
router.patch('/update-info', authMiddleware, userController.updateUserInfo);
router.patch('/change-password', authMiddleware, userController.changePassword);
router.post('/send-deletion-otp', authMiddleware, userController.sendDeletionOtp); // Assuming this is still relevant
router.delete('/delete-account', authMiddleware, userController.deleteAccount);

module.exports = router;
