const express = require('express');
const router = express.Router();
const { addLocker } = require('../controllers/AddLockerController');
const authMiddleware = require('../middleware/authMiddleware');

// Define the route for adding a locker
router.post('/add-locker', authMiddleware, addLocker);

module.exports = router;
