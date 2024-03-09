const rateLimit = require('express-rate-limit');
const User = require('../models/UserModel'); // Adjust the path as necessary
const DummyUser = require('../models/DummyUser'); // Include the DummyUser model

// General rate limit for all users
const generalRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: "Too many requests, please try again later.",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Higher rate limit for premium users
const premiumRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per `window` (here, per 15 minutes)
    message: "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

// Specific rate limit for dummy users
const dummyUserRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per `window` (here, per 15 minutes)
    message: "Too many requests, please try again later for dummy users.",
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware to apply different rate limits based on user type
const dynamicRateLimiter = async (req, res, next) => {
    try {
        // Assume req.user._id contains the user ID and req.user.type indicates the user type ('User', 'Premium', 'DummyUser')
        if (req.user.type === 'DummyUser') {
            const dummyUser = await DummyUser.findById(req.user._id);
            if (dummyUser) {
                return dummyUserRateLimit(req, res, next);
            }
        } else {
            const user = await User.findById(req.user._id);
            if (user && user.isPremium) {
                return premiumRateLimit(req, res, next);
            }
        }
        // Apply general rate limit if user is not premium or a specific check fails
        return generalRateLimit(req, res, next);
    } catch (error) {
        console.error('Error determining user type for rate limiting:', error);
        // Fallback to general rate limit if user determination fails
        return generalRateLimit(req, res, next);
    }
};

module.exports = { generalRateLimit, premiumRateLimit, dummyUserRateLimit, dynamicRateLimiter };
