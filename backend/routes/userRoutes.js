const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

// Middleware placeholders (for future implementation)
// const authMiddleware = require('../middleware/authMiddleware');

// Route for user registration
router.post('/register', userController.registerUser);

// Route for OTP verification (for both registration and account deletion)
router.post('/verify-otp', userController.verifyOtp);

// Route for updating user profile information
router.patch('/update-profile', /* authMiddleware, */ userController.updateProfile);

// Route for toggling the user theme
router.patch('/toggle-theme', /* authMiddleware, */ userController.toggleTheme);

// Route for updating user information
router.patch('/update-info', /* authMiddleware, */ userController.updateUserInfo);

// Route for changing user password
router.patch('/change-password', /* authMiddleware, */ userController.changePassword);

// Route for sending an OTP for account deletion verification
router.post('/send-deletion-otp', /* authMiddleware, */ userController.sendDeletionOtp);

// Route for deleting the account
router.delete('/delete-account', /* authMiddleware, */ userController.deleteAccount);

module.exports = router;
