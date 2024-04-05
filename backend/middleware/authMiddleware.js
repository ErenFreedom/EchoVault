// In authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // The change is here: we use decoded.id instead of decoded.userId
        const user = await User.findById(decoded.id); 
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        req.user = { id: user._id }; // Attach the user ID to the req.user object
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = authMiddleware;
