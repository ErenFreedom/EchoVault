const UserSession = require('../models/UserSession');

// Create a new user session
exports.createUserSession = async (req, res) => {
    const { userId, dummyUserId } = req.body; 
    try {
        const sessionData = userId ? { userId } : { dummyUserId };
        const newSession = new UserSession(sessionData);
        await newSession.save();

        res.status(201).json({ message: "Session started successfully.", sessionId: newSession._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error starting a new session", error: error.toString() });
    }
};

// Update session activity
exports.updateSessionActivity = async (req, res) => {
    const { sessionId } = req.body;

    try {
        const session = await UserSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found." });
        }

        session.lastActivity = new Date();
        await session.save();

        res.status(200).json({ message: "Session activity updated successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating session activity", error: error.toString() });
    }
};

// Check for session expiration
exports.checkSessionExpiration = async (req, res) => {
    const { sessionId } = req.body;

    try {
        const session = await UserSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found." });
        }

        const currentTime = new Date();
        const timeDifference = currentTime - session.lastActivity;
        const idleLimit = 30 * 60 * 1000; 

        if (timeDifference > idleLimit) {
            session.isActive = false;
            await session.save();
            return res.status(200).json({ message: "Session has expired.", expired: true });
        }

        res.status(200).json({ message: "Session is active.", expired: false });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error checking session expiration", error: error.toString() });
    }
};


