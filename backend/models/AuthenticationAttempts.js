const mongoose = require('mongoose');

const authenticationAttemptsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
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
  // Additional fields for professional use
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
  timestamps: true
});

const AuthenticationAttempts = mongoose.model('AuthenticationAttempts', authenticationAttemptsSchema);

module.exports = AuthenticationAttempts;
