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
        const user = await User.findById(decoded.id).select('-password'); // Excluding the password from the user object
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        req.user = user; // Attach the entire user object
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token.', error: error.message });
    }
};

module.exports = authMiddleware;
