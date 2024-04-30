const AccessLog = require('../models/AccessLogs');

// Function to fetch logs for a specific user (normal or dummy)
exports.fetchLogsByUserId = async (req, res) => {
    const { userId, dummyUserId } = req.params; 

    try {
        
        const query = userId ? { userId } : { dummyUserId };

        const logs = await AccessLog.find(query).sort({ timestamp: -1 }); 
        res.status(200).json(logs);
    } catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).json({ message: "Error fetching logs", error: error.message });
    }
};

// Function to fetch logs by action type
exports.fetchLogsByActionType = async (req, res) => {
    const { actionType } = req.params; 

    try {
        const logs = await AccessLog.find({ actionType }).sort({ timestamp: -1 });
        res.status(200).json(logs);
    } catch (error) {
        console.error("Error fetching logs by action type:", error);
        res.status(500).json({ message: "Error fetching logs by action type", error: error.message });
    }
};


exports.fetchLogsByTimeFrame = async (req, res) => {
    const { startTime, endTime } = req.query; 

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

