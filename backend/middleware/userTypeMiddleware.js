const UserSubscription = require('../models/UserSubscription');
const Subscription = require('../models/Subscription');

const ensureIsNormalUser = async (req, res, next) => {
  if (req.userType === 'User') {
    return next();
  } else {
    return res.status(403).json({ message: "Access denied. Not a normal user." });
  }
};

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

const ensureIsDummyUser = async (req, res, next) => {
  if (req.userType === 'DummyUser') {
    return next();
  } else {
    return res.status(403).json({ message: "Access denied. Not a dummy user." });
  }
};

module.exports = { ensureIsNormalUser, ensureIsPremiumUser, ensureIsDummyUser };
