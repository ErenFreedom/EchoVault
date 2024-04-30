const mongoose = require('mongoose');

const linkedAccountSchema = new mongoose.Schema({
  adminUserId: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' 
  },
  linkedUsers: [{
    dummyUserId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DummyUser' 
    },
    permissions: [{
      type: String,
      enum: ['upload', 'delete'], 
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
    default: 3 
  },
  extraAccountsAllowed: {
    type: Number,
    default: 0 
  },
  paymentInfo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransactionLogs' 
  }
}, {
  timestamps: true
});

const LinkedAccount = mongoose.model('LinkedAccount', linkedAccountSchema);

module.exports = LinkedAccount;
