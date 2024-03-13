const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const DummyUser = require('../models/DummyUser');

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to authenticate and verify the JWT token
const authMiddleware = async (req, res, next) => {
    try {
        // Get the token from the authorization header
        const token = req.headers.authorization?.split(' ')[1]; // Authorization: Bearer TOKEN
        if (!token) {
            return res.status(401).json({ message: 'Authentication token is required.' });
        }

        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Find the user based on the token's userId and userType
        let user;
        if (decoded.userType === 'User') {
            user = await User.findById(decoded.userId);
        } else if (decoded.userType === 'DummyUser') {
            user = await DummyUser.findById(decoded.userId);
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Attach user to the request object
        req.user = user;
        req.userType = decoded.userType; // Optional, in case you need to use the user type in your routes

        next(); // Proceed to the next middleware/route handler
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid or expired authentication token.' });
        }
        console.error(error);
        res.status(500).json({ message: 'An error occurred while processing the authentication token.' });
    }
};

module.exports = authMiddleware;
