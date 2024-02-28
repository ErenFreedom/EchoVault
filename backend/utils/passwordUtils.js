const bcrypt = require('bcryptjs');

// Hash a password
exports.hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare a submitted password with a user's hashed password
exports.comparePassword = async (submittedPassword, userPassword) => {
  return bcrypt.compare(submittedPassword, userPassword);
};
