const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const authMiddleware = require('../middleware/authMiddleware'); // Make sure this path matches the location of your middleware

// Route for user registration doesn't require authentication
router.post('/register', userController.registerUser);

// Route for OTP verification can be before authentication for registration
// Consider if you need authMiddleware for other OTP verification scenarios like account deletion
router.post('/verify-otp', userController.verifyOtp);

// Following routes require the user to be logged in
router.patch('/update-profile', authMiddleware, userController.updateProfile);
router.patch('/toggle-theme', authMiddleware, userController.toggleTheme);
router.patch('/update-info', authMiddleware, userController.updateUserInfo);
router.patch('/change-password', authMiddleware, userController.changePassword);
router.post('/send-deletion-otp', authMiddleware, userController.sendDeletionOtp);
router.delete('/delete-account', authMiddleware, userController.deleteAccount);

module.exports = router;
