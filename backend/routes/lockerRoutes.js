const express = require('express');
const router = express.Router();
const lockerController = require('../controllers/LockerController');
const authMiddleware = require('../middleware/authMiddleware'); // Ensure this path is correct
const isPremiumMiddleware = require('../middleware/isPremiumMiddleware'); // Ensure this path is correct

router.get('/user-lockers', authMiddleware, lockerController.getUserLockers);
// Route to create a new locker, ensuring the user is logged in and a premium member
router.post('/create', authMiddleware, isPremiumMiddleware, lockerController.createLocker);

// Assuming granting permissions might also require premium status
router.patch('/permissions', authMiddleware, isPremiumMiddleware, lockerController.grantPermissionsToDummyUser);

module.exports = router;
