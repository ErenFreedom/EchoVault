const TransactionLogs = require('../models/TransactionLogs');
const User = require('../models/User');

// Record a new transaction attempt
exports.createTransactionLog = async (userId, transactionAmount) => {
    try {
        const transactionLog = new TransactionLogs({
            userId,
            transactionType: 'subscription_purchase',
            transactionAmount: transactionAmount,
            transactionStatus: 'pending', // Assuming the transaction starts as pending
        });

        await transactionLog.save();
        console.log("Transaction log created successfully.");
        return transactionLog._id; // Return the ID of the created log
    } catch (error) {
        console.error("Error creating transaction log: ", error);
        throw error; // Propagate the error
    }
};

// Update transaction status
exports.updateTransactionStatus = async (transactionId, status, additionalInfo = '') => {
    try {
        const transactionLog = await TransactionLogs.findById(transactionId);
        if (!transactionLog) {
            console.error("Transaction log not found.");
            return false;
        }

        transactionLog.transactionStatus = status;
        if (additionalInfo) {
            transactionLog.additionalInfo = additionalInfo;
        }

        await transactionLog.save();
        console.log("Transaction status updated successfully.");
        return true;
    } catch (error) {
        console.error("Error updating transaction status: ", error);
        throw error; // Propagate the error
    }
};

// Get transaction logs for a user
exports.getUserTransactionLogs = async (req, res) => {
    const userId = req.user._id; // Assuming user ID comes from authenticated session

    try {
        const transactions = await TransactionLogs.find({ userId: userId });
        res.status(200).json(transactions);
    } catch (error) {
        console.error("Error fetching transaction logs: ", error);
        res.status(500).json({ message: "Error fetching transaction logs", error: error.toString() });
    }
};


module.exports={
    createTransactionLog,
    updateTransactionStatus,
    getUserTransactionLogs
}