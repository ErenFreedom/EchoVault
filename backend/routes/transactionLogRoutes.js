const express = require('express');
const router = express.Router();
const {
    createTransactionLog,
    updateTransactionStatus,
    getUserTransactionLogs
} = require('../controllers/TransactionLogController');
const authMiddleware = require('../middleware/authMiddleware');
const { ensureIsNormalUser } = require('../middleware/userTypeMiddleware');
const errorHandler = require('../middleware/errorMiddleware');

// Middleware to ensure only authenticated normal users can access these routes
const authenticateAndEnsureNormalUser = [authMiddleware, ensureIsNormalUser];

// Route to create a new transaction log for upgrading to premium
router.post('/create', authenticateAndEnsureNormalUser, async (req, res, next) => {
    try {
        const { transactionAmount } = req.body; // Assuming transactionAmount is passed in request
        // userId is extracted from authenticated session
        const transactionLogId = await createTransactionLog(req.user._id, transactionAmount);
        res.status(201).json({ message: "Transaction log created successfully", transactionLogId });
    } catch (error) {
        next(error); // Forward error to error handling middleware
    }
});

// Route to update the status of a transaction log
router.post('/update-status', authenticateAndEnsureNormalUser, async (req, res, next) => {
    try {
        const { transactionId, status, additionalInfo } = req.body;
        const success = await updateTransactionStatus(transactionId, status, additionalInfo);
        if (success) {
            res.status(200).json({ message: "Transaction status updated successfully" });
        } else {
            res.status(404).json({ message: "Transaction log not found" });
        }
    } catch (error) {
        next(error); // Forward error to error handling middleware
    }
});

// Route to get all transaction logs for the authenticated user
router.get('/user-transactions', authenticateAndEnsureNormalUser, async (req, res, next) => {
    try {
        const transactions = await getUserTransactionLogs(req.user._id);
        res.status(200).json(transactions);
    } catch (error) {
        next(error); // Forward error to error handling middleware
    }
});

// Use the error handling middleware for this router
router.use(errorHandler);

module.exports = router;
