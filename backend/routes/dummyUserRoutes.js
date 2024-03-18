const express = require('express');
const router = express.Router();
const dummyUserController = require('../controllers/DummyUserController');
const authMiddleware = require('../middleware/authMiddleware'); // Ensure you have implemented this middleware

// Route to register a dummy user and send OTP to the premium user's email
// No authMiddleware here because the dummy user is not yet authenticated
router.post('/register', dummyUserController.registerDummyUser);

// Route for OTP verification to complete the dummy user registration
// No authMiddleware here because the dummy user is not yet authenticated
router.post('/verify-otp', dummyUserController.verifyDummyUserOtp);

// Routes below this line require the user to be authenticated
// AuthMiddleware is included to ensure only authenticated users can access these endpoints

// Route to toggle the theme for a dummy user
router.patch('/toggle-theme', authMiddleware, dummyUserController.toggleThemeDummyUser);

// Route to update dummy user information
router.patch('/update-info', authMiddleware, dummyUserController.updateDummyUserInfo);

// Route to change the password of a dummy user
router.patch('/change-password', authMiddleware, dummyUserController.changeDummyUserPassword);

// Route to unlink (delete) a dummy user account
router.delete('/unlink-account', authMiddleware, dummyUserController.unlinkDummyUserAccount);

module.exports = router;
