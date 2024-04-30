const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return !this.dummyUserId; } 
  },
  dummyUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DummyUser',
    required: function() { return !this.userId; } 
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

userSessionSchema.virtual('userType').get(function() {
  return this.userId ? 'Admin' : 'Dummy';
});

userSessionSchema.methods.checkForTimeout = function() {
  const idleLimit = 5 * 60 * 1000; 
  const currentTime = new Date();
  const timeDifference = currentTime - this.lastActivity;

  if (timeDifference > idleLimit) {
    this.isActive = false; 
  } else {
    this.lastActivity = currentTime; e
  }
  return this.isActive;
};

userSessionSchema.statics.findActiveSessionByUserId = function(userId) {
  return this.findOne({
    userId,
    isActive: true
  }).exec();
};

userSessionSchema.statics.findActiveSessionByDummyUserId = function(dummyUserId) {
  return this.findOne({
    dummyUserId,
    isActive: true
  }).exec();
};

const UserSession = mongoose.model('UserSession', userSessionSchema);

module.exports = UserSession;
