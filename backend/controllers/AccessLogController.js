// Import necessary models
const AccessLog = require('../models/AccessLogs');

// Function to fetch logs for a specific user (normal or dummy)
exports.fetchLogsByUserId = async (req, res) => {
    const { userId, dummyUserId } = req.params; // Assume the IDs come from request parameters or body

    try {
        // Build query based on whether it's a normal user or dummy user
        const query = userId ? { userId } : { dummyUserId };

        const logs = await AccessLog.find(query).sort({ timestamp: -1 }); // Sort by newest first
        res.status(200).json(logs);
    } catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).json({ message: "Error fetching logs", error: error.message });
    }
};

// Function to fetch logs by action type
exports.fetchLogsByActionType = async (req, res) => {
    const { actionType } = req.params; // Assume actionType comes from request parameters

    try {
        const logs = await AccessLog.find({ actionType }).sort({ timestamp: -1 });
        res.status(200).json(logs);
    } catch (error) {
        console.error("Error fetching logs by action type:", error);
        res.status(500).json({ message: "Error fetching logs by action type", error: error.message });
    }
};

// Function to fetch logs within a specific time frame
exports.fetchLogsByTimeFrame = async (req, res) => {
    const { startTime, endTime } = req.query; // Assume startTime and endTime come from query parameters

    try {
        const logs = await AccessLog.find({
            timestamp: { $gte: new Date(startTime), $lte: new Date(endTime) }
        }).sort({ timestamp: -1 });

        res.status(200).json(logs);
    } catch (error) {
        console.error("Error fetching logs by time frame:", error);
        res.status(500).json({ message: "Error fetching logs by time frame", error: error.message });
    }
};

