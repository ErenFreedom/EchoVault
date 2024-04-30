const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const User = require('../models/UserModel'); 

const authMiddleware = require('../middleware/authMiddleware'); 

router.post('/register', userController.registerUser);

router.post('/verify-otp', userController.verifyOtp); 
router.post('/resend-otp', userController.resendOtp); 
router.get('/data', authMiddleware, async (req, res) => {
    try {
        
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error fetching user data', error: error.toString() });
    }
});
router.get('/linked-guest-accounts/:userId', userController.getLinkedGuestAccounts);

router.patch('/update-profile', authMiddleware, userController.updateProfile);
router.patch('/toggle-theme', authMiddleware, userController.toggleTheme);
router.patch('/update-info', authMiddleware, userController.updateUserInfo);
router.patch('/change-password', authMiddleware, userController.changePassword);
router.post('/send-deletion-otp', authMiddleware, userController.sendDeletionOtp); 
router.delete('/delete-account', authMiddleware, userController.deleteAccount);

module.exports = router;
