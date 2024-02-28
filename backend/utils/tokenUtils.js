const jwt = require('jsonwebtoken');

// Generate a token
exports.generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d', // expires in 30 days
  });
};

// Verify a token (could be used in middleware or wherever needed)
exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
