const express = require('express');
const router = express.Router();
const dummyUserController = require('../controllers/DummyUserController');
const authMiddleware = require('../middleware/authMiddleware'); // Ensure this middleware is correctly implemented

// Route to register a dummy user and send an email to the premium user for confirmation
// No authMiddleware here because the dummy user is not yet authenticated
router.post('/register', dummyUserController.registerGuestUser);

// Route for confirming the dummy user registration via OTP verification
// This replaces the previous email confirmation link with an OTP-based confirmation
// router.post('/confirm-registration', dummyUserController.verifyGuestUserOtp);// Assuming you have implemented this in DummyUserController

// Routes below this line require the user to be authenticated
// authMiddleware is included to ensure only authenticated users can access these endpoints
//router.get('/linked-guest-accounts', authMiddleware, dummyUserController.getLinkedGuestAccounts);

// Route to toggle the theme for a dummy user
router.patch('/toggle-theme', authMiddleware, dummyUserController.toggleThemeDummyUser);

// Route to update dummy user information
router.patch('/update-info', authMiddleware, dummyUserController.updateDummyUserInfo);

// Route to change the password of a dummy user
router.patch('/change-password', authMiddleware, dummyUserController.changeDummyUserPassword);

// Route to unlink (delete) a dummy user account
router.delete('/unlink-account', authMiddleware, dummyUserController.unlinkDummyUserAccount);

module.exports = router;
