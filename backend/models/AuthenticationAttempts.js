const mongoose = require('mongoose');

const authenticationAttemptsSchema = new mongoose.Schema({
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
  attemptTime: {
    type: Date,
    default: Date.now
  },
  successFlag: {
    type: Boolean,
    required: true
  },
  ipAddress: {
    type: String,
    required: true,
    trim: true
  },
  deviceInfo: {
    type: String,
    required: true,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  method: {
    type: String,
    required: true,
    enum: ['password', 'otp', 'biometric', 'two_factor', 'other'],
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true }
});

authenticationAttemptsSchema.virtual('authenticatorType').get(function() {
  return this.userId ? 'Admin User' : 'Dummy User';
});

authenticationAttemptsSchema.statics.findByAdminUserId = function(adminUserId) {
  return this.find({ userId: adminUserId });
};

authenticationAttemptsSchema.statics.findByDummyUserId = function(dummyUserId) {
  return this.find({ dummyUserId: dummyUserId });
};

const AuthenticationAttempts = mongoose.model('AuthenticationAttempts', authenticationAttemptsSchema);

module.exports = AuthenticationAttempts;
