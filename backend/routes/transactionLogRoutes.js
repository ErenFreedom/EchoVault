const express = require('express');
const router = express.Router();
const transactionLogController = require('../controllers/TransactionLogController');

// Middleware placeholders (for future implementation)
// const authMiddleware = require('../middleware/authMiddleware');

// Route to get transaction logs for the authenticated user
router.get('/user-logs', /* authMiddleware, */ transactionLogController.getUserTransactionLogs);

module.exports = router;
