const mongoose = require('mongoose');

const linkedAccountSchema = new mongoose.Schema({
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Admin User
  },
  linkedUsers: [{
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Linked User Account
    },
    firstName: { // First name of the linked user
      type: String,
      required: true,
      trim: true
    },
    lastName: { // Last name of the linked user
      type: String,
      required: true,
      trim: true
    },
    permissions: [{
      type: String,
      enum: ['upload', 'delete'], // Specifies allowed actions for linked accounts
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
    default: 3 // Base case limit for linked accounts without extra payment
  },
  extraAccountsAllowed: {
    type: Number,
    default: 0 // Additional accounts can be added beyond the base limit
  },
  paymentInfo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransactionLogs', // Reference the payment transaction if extra accounts are added
    default: null
  }
}, {
  timestamps: true
});

const LinkedAccount = mongoose.model('LinkedAccount', linkedAccountSchema);

module.exports = LinkedAccount;
