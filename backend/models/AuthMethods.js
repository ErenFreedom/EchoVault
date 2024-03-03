const mongoose = require('mongoose');

const authMethodSchema = new mongoose.Schema({
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
  methodType: {
    type: String,
    required: true,
    enum: ['password', 'otp_email', 'otp_sms', 'security_question', 'other'],
    trim: true
  },
  details: {
    type: String,
    trim: true
  },
  lastUsed: {
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

// Virtual property to identify the type of user (Admin or Dummy)
authMethodSchema.virtual('userType').get(function() {
  return this.userId ? 'Admin' : 'Dummy';
});

// Static method to find auth methods by admin user ID
authMethodSchema.statics.findByUserId = function(userId) {
  return this.find({ userId });
};

// Static method to find auth methods by dummy user ID
authMethodSchema.statics.findByDummyUserId = function(dummyUserId) {
  return this.find({ dummyUserId });
};

const AuthMethod = mongoose.model('AuthMethod', authMethodSchema);

module.exports = AuthMethod;
