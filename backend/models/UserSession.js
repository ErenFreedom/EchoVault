const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return !this.dummyUserId; } // Required if dummyUserId is not provided
  },
  dummyUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DummyUser',
    required: function() { return !this.userId; } // Required if userId is not provided
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual property to identify session user type
userSessionSchema.virtual('userType').get(function() {
  return this.userId ? 'Admin' : 'Dummy';
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

// Static method to find an active session by admin user
userSessionSchema.statics.findActiveSessionByUserId = function(userId) {
  return this.findOne({
    userId,
    isActive: true
  }).exec();
};

// Static method to find an active session by dummy user
userSessionSchema.statics.findActiveSessionByDummyUserId = function(dummyUserId) {
  return this.findOne({
    dummyUserId,
    isActive: true
  }).exec();
};

const UserSession = mongoose.model('UserSession', userSessionSchema);

module.exports = UserSession;
