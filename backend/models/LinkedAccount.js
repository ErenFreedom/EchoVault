const mongoose = require('mongoose');

const linkedAccountSchema = new mongoose.Schema({
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  linkedUsers: [{
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
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
    ref: 'TransactionLogs', // If extra accounts are added, reference the payment transaction
    default: null
  }
}, {
  timestamps: true
});

const LinkedAccount = mongoose.model('LinkedAccount', linkedAccountSchema);

module.exports = LinkedAccount;
