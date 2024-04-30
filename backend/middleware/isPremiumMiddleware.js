const User = require('../models/UserModel'); 

// Middleware to check if the user is a premium user
const isPremiumMiddleware = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Authentication required." });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user.isPremium) {
            return res.status(403).json({ message: "This action is reserved for premium members only." });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: "An error occurred verifying premium status.", error: error.message });
    }
};

module.exports = isPremiumMiddleware;
