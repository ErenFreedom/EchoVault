// controllers/AuthenticationAttemptsController.js

const AuthenticationAttempts = require('../models/AuthenticationAttempts');
const User = require('../models/User'); // Assuming you have a User model that stores lockout information

const MAX_ATTEMPTS = parseInt(process.env.MAX_ATTEMPTS, 10);
const LOCK_TIME = parseInt(process.env.LOCK_TIME, 10); // Make sure to store lock time in milliseconds

exports.recordAttempt = async ({ userId, ipAddress, deviceInfo, userAgent, location, method, successFlag }) => {
  // Create a new authentication attempt record
  const attempt = new AuthenticationAttempts({
    userId,
    ipAddress,
    deviceInfo,
    userAgent,
    location,
    method,
    successFlag
  });

  await attempt.save();

  if (!successFlag) {
    // Check the number of failed attempts within the lockout time frame
    const failedAttempts = await AuthenticationAttempts.countDocuments({
      userId,
      successFlag: false,
      attemptTime: { $gte: new Date(Date.now() - LOCK_TIME) }
    });

    if (failedAttempts >= MAX_ATTEMPTS) {
      // Lock the user account by updating the lockUntil time
      await User.findByIdAndUpdate(userId, { $set: { lockUntil: new Date(Date.now() + LOCK_TIME) } });
      // Throw an error or handle as appropriate for your application
      throw new Error('Account is temporarily locked due to too many failed attempts');
    }
  }
};

exports.isAccountLocked = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Check if the account is locked and the lock is still in effect
  if (user.lockUntil && user.lockUntil > Date.now()) {
    return true;
  }

  return false;
};

exports.unlockAccount = async (userId) => {
  // Unlock the user account by resetting the lockUntil field
  await User.findByIdAndUpdate(userId, { $unset: { lockUntil: "" } });
};

module.exports = {
  recordAttempt,
  isAccountLocked,
  unlockAccount
  
};