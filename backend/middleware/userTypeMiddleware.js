const User = require('../models/User'); // Adjust with your User model path
const DummyUser = require('../models/DummyUser'); // Adjust with your DummyUser model path

// Middleware to ensure the user is at least a normal user
const ensureIsNormalOrHigher = async (req, res, next) => {
  const userId = req.user.id; // Assuming req.user.id is set by previous authMiddleware

  try {
    const user = await User.findById(userId);
    if (user) { // If the user exists in the User collection, proceed
      req.userDetails = user; // Optional: Attach user details to req for further use
      return next();
    }
    // If not found in User, check if it's a DummyUser
    const dummyUser = await DummyUser.findById(userId);
    if (dummyUser) {
      return res.status(403).json({ message: "Access denied. Feature not available for guest users." });
    }
    return res.status(404).json({ message: "User not found." });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.toString() });
  }
};

// Middleware to ensure the user is a premium user
const ensureIsPremium = async (req, res, next) => {
  const userId = req.user.id; // Assuming req.user.id is set by previous authMiddleware
  try {
    const user = await User.findById(userId);
    if (user && user.isPremium) { // Check if user is premium
      req.userDetails = user; // Optional: Attach user details to req for further use
      return next();
    }
    return res.status(403).json({ message: "Access denied. Only premium users are allowed." });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.toString() });
  }
};

module.exports = {
  ensureIsNormalOrHigher,
  ensureIsPremium
};
