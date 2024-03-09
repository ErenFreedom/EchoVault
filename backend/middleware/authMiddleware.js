const jwt = require('jsonwebtoken');
const User = require('../models/UserModel'); // Adjust the path as necessary
const DummyUser = require('../models/DummyUser');

const JWT_SECRET = process.env.JWT_SECRET; // Ensure this is set in your environment

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Assuming token is sent as "Bearer <token>"
    if (!token) {
      return res.status(401).json({ message: "Authentication token is required" });
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Attach user or dummy user information to the request
    let user;
    if (decoded.userType === 'User' || decoded.userType === 'Premium') {
      user = await User.findById(decoded.userId);
    } else if (decoded.userType === 'DummyUser') {
      user = await DummyUser.findById(decoded.userId);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = {
      id: user._id,
      userType: decoded.userType,
      // Include any other user properties you need
    };

    next(); // Proceed to the next middleware or controller
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token has expired" });
    }
    console.error("Authentication middleware error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = authenticate;
