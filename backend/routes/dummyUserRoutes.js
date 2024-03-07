const express = require('express');
const router = express.Router();
const dummyUserController = require('../controllers/DummyUserController');

// Route to handle registration of a dummy user
router.post('/register', dummyUserController.registerDummyUser);

// Route to handle OTP verification for dummy user registration
router.post('/verify-otp', dummyUserController.verifyDummyUserOtp);

// Route to toggle theme for a dummy user
router.post('/toggle-theme', dummyUserController.toggleThemeDummyUser);

// Route to update dummy user information
router.put('/update-info', dummyUserController.updateDummyUserInfo);

// Route to change dummy user password
router.post('/change-password', dummyUserController.changeDummyUserPassword);

// Route to unlink (delete) a dummy user account
router.delete('/unlink-account', dummyUserController.unlinkDummyUserAccount);

module.exports = router;
