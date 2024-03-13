const express = require('express');
const router = express.Router();
const lockerController = require('../controllers/LockerController');

// Middleware placeholders (for future implementation)
// const authMiddleware = require('../middleware/authMiddleware');

// Route to create a new locker
router.post('/create', /* authMiddleware, */ lockerController.createLocker);

// Route to grant permissions to a dummy user for a locker
router.patch('/permissions', /* authMiddleware, */ lockerController.grantPermissionsToDummyUser);

module.exports = router;
