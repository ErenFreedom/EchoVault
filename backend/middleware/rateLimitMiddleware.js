const rateLimit = require('express-rate-limit');
const User = require('../models/UserModel'); 
const DummyUser = require('../models/DummyUser'); 

// General rate limit for all users
const generalRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: "Too many requests, please try again later.",
    standardHeaders: true, 
    legacyHeaders: false, 
});

const premiumRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 200, 
    message: "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

const dummyUserRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 50, 
    message: "Too many requests, please try again later for dummy users.",
    standardHeaders: true,
    legacyHeaders: false,
});

const dynamicRateLimiter = async (req, res, next) => {
    try {
        
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
        
        return generalRateLimit(req, res, next);
    } catch (error) {
        console.error('Error determining user type for rate limiting:', error);
       
        return generalRateLimit(req, res, next);
    }
};

module.exports = { generalRateLimit, premiumRateLimit, dummyUserRateLimit, dynamicRateLimiter };
