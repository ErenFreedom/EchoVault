const express = require('express');
const router = express.Router();
const accessLogController = require('../controllers/AccessLogController');

// Route to fetch logs for a specific user (normal or dummy)
// Assuming you're using path parameters for userId or dummyUserId
router.get('/user/:userId', accessLogController.fetchLogsByUserId);
router.get('/dummy-user/:dummyUserId', accessLogController.fetchLogsByUserId);

// Route to fetch logs by action type
router.get('/action/:actionType', accessLogController.fetchLogsByActionType);

// Route to fetch logs within a specific time frame
router.get('/time-frame', accessLogController.fetchLogsByTimeFrame);

module.exports = router;
