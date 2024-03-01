const mongoose = require('mongoose');

const authMethodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  methodType: {
    type: String,
    required: true,
    enum: ['password', 'otp_email', 'otp_sms', 'security_question', 'other'], // Add more as needed
    trim: true
  },
  details: {
    type: String, // This could be a description or any relevant data for the auth method
    trim: true
  },
  lastUsed: {
    type: Date, // When was this method last used for authentication
    default: Date.now
  },
  isActive: {
    type: Boolean, // Is this authentication method currently active?
    default: true
  }
}, {
  timestamps: true // This will add both createdAt and updatedAt timestamps
});

const AuthMethod = mongoose.model('AuthMethod', authMethodSchema);

module.exports = AuthMethod;
