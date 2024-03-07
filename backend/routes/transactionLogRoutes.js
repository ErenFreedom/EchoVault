const express = require('express');
const router = express.Router();
const { createTransactionLog, updateTransactionStatus, getUserTransactionLogs } = require('../controllers/TransactionLogController');

// Middleware for authentication, to ensure only authenticated users can access these routes
const { authenticateUser } = require('../middlewares/authMiddleware');

// Route to create a new transaction log
// Assuming this is called when a new transaction is initiated
router.post('/create', authenticateUser, async (req, res) => {
    const { userId, transactionAmount } = req.body;
    try {
        const transactionLogId = await createTransactionLog(userId, transactionAmount);
        res.status(201).json({ message: "Transaction log created successfully", transactionLogId });
    } catch (error) {
        res.status(500).json({ message: "Error creating transaction log", error: error.toString() });
    }
});

// Route to update the status of a transaction log
router.post('/update-status', authenticateUser, async (req, res) => {
    const { transactionId, status, additionalInfo } = req.body;
    try {
        const success = await updateTransactionStatus(transactionId, status, additionalInfo);
        if (success) {
            res.status(200).json({ message: "Transaction status updated successfully" });
        } else {
            res.status(404).json({ message: "Transaction log not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error updating transaction status", error: error.toString() });
    }
});

// Route to get all transaction logs for a user
router.get('/user-transactions', authenticateUser, async (req, res) => {
    const userId = req.user._id; // Extract the user ID from the authenticated user
    try {
        const transactions = await getUserTransactionLogs({ user_id: userId });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: "Error fetching transaction logs", error: error.toString() });
    }
});

// Export the router
module.exports = router;
