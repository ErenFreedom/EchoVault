// controllers/AccessController.js

const AccessLog = require('../models/AccessLogs'); // Adjust if your file name is different

const createAccessLog = async (logDetails) => {
  try {
    const logEntry = new AccessLog(logDetails);
    await logEntry.save();
    console.log('Access log entry created successfully.');
  } catch (error) {
    console.error('Error creating access log entry:', error);
    throw error; // Rethrow the error for the caller to handle
  }
};

const getAccessLogsByUser = async (userId) => {
  try {
    const logs = await AccessLog.find({ userId }).sort({ timestamp: -1 });
    return logs;
  } catch (error) {
    console.error('Error retrieving access logs for user:', error);
    throw error;
  }
};

const getAccessLogsSummary = async () => {
  try {
    const summary = await AccessLog.aggregate([
      { $group: { _id: "$actionType", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    return summary;
  } catch (error) {
    console.error('Error retrieving access logs summary:', error);
    throw error;
  }
};

const getRecentAccessLogs = async (limit = 10) => {
  try {
    const recentLogs = await AccessLog.find().sort({ timestamp: -1 }).limit(limit);
    return recentLogs;
  } catch (error) {
    console.error('Error retrieving recent access logs:', error);
    throw error;
  }
};

const getFailedAccessAttempts = async () => {
  try {
    const failedAttempts = await AccessLog.find({ outcome: 'failure' }).sort({ timestamp: -1 });
    return failedAttempts;
  } catch (error) {
    console.error('Error retrieving failed access attempts:', error);
    throw error;
  }
};

module.exports = {
  createAccessLog,
  getAccessLogsByUser,
  getAccessLogsSummary,
  getRecentAccessLogs,
  getFailedAccessAttempts
};
