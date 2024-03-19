const express = require('express');
const router = express.Router();
const dummyUserController = require('../controllers/DummyUserController');
const authMiddleware = require('../middleware/authMiddleware'); // Ensure this middleware is correctly implemented

// Route to register a dummy user and send an email to the premium user for confirmation
// No authMiddleware here because the dummy user is not yet authenticated
router.post('/register', dummyUserController.registerDummyUser);

// Route for confirming the dummy user registration through email link
// This is the new route to handle email confirmation link clicks
// Depending on your implementation, this might not require authMiddleware as it's part of the registration process
router.get('/confirm-registration', dummyUserController.confirmRegistration); // Assuming you have implemented this in DummyUserController

// Routes below this line require the user to be authenticated
// authMiddleware is included to ensure only authenticated users can access these endpoints

// Route to toggle the theme for a dummy user
router.patch('/toggle-theme', authMiddleware, dummyUserController.toggleThemeDummyUser);

// Route to update dummy user information
router.patch('/update-info', authMiddleware, dummyUserController.updateDummyUserInfo);

// Route to change the password of a dummy user
router.patch('/change-password', authMiddleware, dummyUserController.changeDummyUserPassword);

// Route to unlink (delete) a dummy user account
router.delete('/unlink-account', authMiddleware, dummyUserController.unlinkDummyUserAccount);

module.exports = router;
