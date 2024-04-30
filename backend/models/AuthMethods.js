const mongoose = require('mongoose');

const authMethodSchema = new mongoose.Schema({
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

authMethodSchema.virtual('userType').get(function() {
  return this.userId ? 'Admin' : 'Dummy';
});

authMethodSchema.statics.findByUserId = function(userId) {
  return this.find({ userId });
};

authMethodSchema.statics.findByDummyUserId = function(dummyUserId) {
  return this.find({ dummyUserId });
};

const AuthMethod = mongoose.model('AuthMethod', authMethodSchema);

module.exports = AuthMethod;
