const express = require('express');
const router = express.Router();
const dummyUserController = require('../controllers/DummyUserController');
const authMiddleware = require('../middleware/authMiddleware'); 


router.post('/register', dummyUserController.registerGuestUser);



// Route to toggle the theme for a dummy user
router.patch('/toggle-theme', authMiddleware, dummyUserController.toggleThemeDummyUser);

// Route to update dummy user information
router.patch('/update-info', authMiddleware, dummyUserController.updateDummyUserInfo);

// Route to change the password of a dummy user
router.patch('/change-password', authMiddleware, dummyUserController.changeDummyUserPassword);

// Route to unlink (delete) a dummy user account
router.delete('/unlink-account', authMiddleware, dummyUserController.unlinkDummyUserAccount);

module.exports = router;
