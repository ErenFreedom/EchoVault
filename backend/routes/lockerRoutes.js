const express = require('express');
const router = express.Router();
const lockerController = require('../controllers/LockerController');
const authMiddleware = require('../middleware/authMiddleware'); 
const isPremiumMiddleware = require('../middleware/isPremiumMiddleware'); 

router.get('/user-lockers', authMiddleware, lockerController.getUserLockers);
router.post('/create', authMiddleware, isPremiumMiddleware, lockerController.createLocker);

router.patch('/permissions', authMiddleware, isPremiumMiddleware, lockerController.grantPermissionsToDummyUser);

module.exports = router;
