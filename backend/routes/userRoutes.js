const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth'); // Assume you have an authentication middleware to verify tokens

// Route to handle user registration
router.post('/register', userController.registerUser);

// Route to verify OTP for user registration
router.post('/verify-otp', userController.verifyOtp);

// Route to update user profile
router.put('/profile', authMiddleware, userController.updateProfile);

// Route to toggle user theme preference
router.patch('/toggle-theme', authMiddleware, userController.toggleTheme);

// Route to update user information
router.put('/info', authMiddleware, userController.updateUserInfo);

// Route to change user password
router.post('/change-password', authMiddleware, userController.changePassword);

// Route to send OTP for account deletion
router.get('/send-deletion-otp', authMiddleware, userController.sendDeletionOtp);

// Route to delete user account
router.delete('/delete-account', authMiddleware, userController.deleteAccount);

module.exports = router;
