const express = require('express');
const router = express.Router();
const {
    fetchLogsByUserId,
    fetchLogsByActionType,
    fetchLogsByTimeFrame
} = require('../controllers/AccessLogController');
const authMiddleware = require('../middleware/authMiddleware');
const { ensureIsNormalUser, ensureIsPremiumUser, ensureIsDummyUser } = require('../middleware/userTypeMiddleware');

// General middleware to authenticate all routes in this file
router.use(authMiddleware);

// Route to fetch logs for a specific normal or premium user
router.get('/by-user/:userId', ensureIsNormalUser, fetchLogsByUserId);
router.get('/by-premium-user/:userId', ensureIsPremiumUser, fetchLogsByUserId);

// This route is specifically for dummy users, applying additional checks if needed
router.get('/by-dummy-user/:dummyUserId', ensureIsDummyUser, fetchLogsByUserId);

// Routes to fetch logs by action type, accessible by normal and premium users
router.get('/by-action-type/:actionType', ensureIsNormalUser, fetchLogsByActionType);

// Routes to fetch logs within a specific time frame, accessible by normal and premium users
router.get('/by-time-frame', ensureIsNormalUser, fetchLogsByTimeFrame);

module.exports = router;
