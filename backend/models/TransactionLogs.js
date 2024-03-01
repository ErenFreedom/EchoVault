const mongoose = require('mongoose');

const transactionLogsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  transactionType: {
    type: String,
    required: true,
    enum: ['subscription_purchase', 'other'],
    default: 'other'
  },
  transactionAmount: {
    type: Number,
    required: true
  },
  transactionDate: {
    type: Date,
    default: Date.now
  },
  transactionStatus: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionDetails: {
    type: Map,
    of: String
  },
  additionalInfo: {
    type: String
  }
}, {
  timestamps: true
});

const TransactionLogs = mongoose.model('TransactionLogs', transactionLogsSchema);

module.exports = TransactionLogs;
