const mongoose = require('mongoose');

const linkedAccountSchema = new mongoose.Schema({
  adminUserId: { // Renamed for clarity
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Admin User
  },
  linkedUsers: [{
    dummyUserId: { // Reference to the DummyUser model
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DummyUser' // Reference to Dummy User Account
    },
    permissions: [{
      type: String,
      enum: ['upload', 'delete'], // Specifies allowed actions for dummy accounts
    }],
    addedDate: {
      type: Date,
      default: Date.now
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationReason: {
      type: String,
      trim: true
    }
  }],
  baseLimit: {
    type: Number,
    default: 3 // Base limit for linked accounts without extra payment
  },
  extraAccountsAllowed: {
    type: Number,
    default: 0 // Additional accounts can be added beyond the base limit
  },
  paymentInfo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransactionLogs' // Reference the payment transaction if extra accounts are added
  }
}, {
  timestamps: true
});

const LinkedAccount = mongoose.model('LinkedAccount', linkedAccountSchema);

module.exports = LinkedAccount;
