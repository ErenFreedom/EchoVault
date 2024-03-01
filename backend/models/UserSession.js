const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  sessionStart: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Middleware to check for session timeout
userSessionSchema.methods.checkForTimeout = function() {
  const idleLimit = 5 * 60 * 1000; // 5 minutes in milliseconds
  const currentTime = new Date();
  const timeDifference = currentTime - this.lastActivity;

  if (timeDifference > idleLimit) {
    this.isActive = false; // Set the session to inactive
  } else {
    this.lastActivity = currentTime; // Update the last activity to the current time
  }
  return this.isActive;
};

// Static method to find an active session
userSessionSchema.statics.findActiveSession = function(userId) {
  return this.findOne({
    userId: userId,
    isActive: true
  }).exec();
};

const UserSession = mongoose.model('UserSession', userSessionSchema);

module.exports = UserSession;
