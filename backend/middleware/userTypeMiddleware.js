const UserSubscription = require('../models/UserSubscription');
const Subscription = require('../models/Subscription');

// Middleware to check if the user is a normal user
const ensureIsNormalUser = async (req, res, next) => {
  if (req.userType === 'User') {
    return next();
  } else {
    return res.status(403).json({ message: "Access denied. Not a normal user." });
  }
};

// Middleware to check if the user is a premium user
const ensureIsPremiumUser = async (req, res, next) => {
  try {
    const subscription = await UserSubscription.findOne({
      userId: req.user._id,
      isActive: true,
    }).populate('subscriptionId');

    if (subscription && subscription.subscriptionId.planName === "PremiumLocker") {
      return next();
    } else {
      return res.status(403).json({ message: "Access denied. Not a premium user." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to verify premium user status." });
  }
};

// Middleware to check if the user is a dummy user
const ensureIsDummyUser = async (req, res, next) => {
  if (req.userType === 'DummyUser') {
    return next();
  } else {
    return res.status(403).json({ message: "Access denied. Not a dummy user." });
  }
};

module.exports = { ensureIsNormalUser, ensureIsPremiumUser, ensureIsDummyUser };
