const express = require('express');
const router = express.Router();
const dummyUserController = require('../controllers/DummyUserController');

// Middleware placeholders (for future implementation)
// const authMiddleware = require('../middleware/authMiddleware');

// Route to register a dummy user and send OTP to the premium user's email
router.post('/register', dummyUserController.registerDummyUser);

// Route for OTP verification to complete the dummy user registration
router.post('/verify-otp', /* authMiddleware, */ dummyUserController.verifyDummyUserOtp);

// Route to toggle the theme for a dummy user
router.patch('/toggle-theme', /* authMiddleware, */ dummyUserController.toggleThemeDummyUser);

// Route to update dummy user information
router.patch('/update-info', /* authMiddleware, */ dummyUserController.updateDummyUserInfo);

// Route to change the password of a dummy user
router.patch('/change-password', /* authMiddleware, */ dummyUserController.changeDummyUserPassword);

// Route to unlink (delete) a dummy user account
router.delete('/unlink-account', /* authMiddleware, */ dummyUserController.unlinkDummyUserAccount);

module.exports = router;
