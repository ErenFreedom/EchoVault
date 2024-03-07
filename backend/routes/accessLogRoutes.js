const express = require('express');
const router = express.Router();
const {
    fetchLogsByUserId,
    fetchLogsByActionType,
    fetchLogsByTimeFrame
} = require('../controllers/AccessLogController');

// Middleware for authentication to ensure only authorized users can access these routes
const { authenticateUser } = require('../middlewares/authMiddleware');

// Route to fetch logs for a specific user (normal or dummy)
router.get('/by-user/:userId', authenticateUser, fetchLogsByUserId);
router.get('/by-dummy-user/:dummyUserId', authenticateUser, fetchLogsByUserId); // If you decide to differentiate routes for normal and dummy users

// Route to fetch logs by action type
router.get('/by-action-type/:actionType', authenticateUser, fetchLogsByActionType);

// Route to fetch logs within a specific time frame
router.get('/by-time-frame', authenticateUser, fetchLogsByTimeFrame);

// Export the router
module.exports = router;
