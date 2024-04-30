const express = require('express');
const router = express.Router();
const accessLogController = require('../controllers/AccessLogController');

router.get('/user/:userId', accessLogController.fetchLogsByUserId);
router.get('/dummy-user/:dummyUserId', accessLogController.fetchLogsByUserId);

router.get('/action/:actionType', accessLogController.fetchLogsByActionType);

router.get('/time-frame', accessLogController.fetchLogsByTimeFrame);

module.exports = router;
