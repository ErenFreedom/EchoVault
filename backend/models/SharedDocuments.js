const mongoose = require('mongoose');

const sharedDocumentSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Document'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  shareDate: {
    type: Date,
    default: Date.now
  },
  expireDate: {
    type: Date
  },
  ownerSubscriptionStatus: {
    type: String,
    required: true,
    enum: ['normal', 'premium'],
    default: 'normal'
  },
  accessFee: { // This fee is applicable if the owner is not a premium user
    type: Number,
    default: 0
  },
  transactionId: { // Reference to the payment transaction if an access fee is paid
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransactionLogs',
    default: null
  },
  isOwnerPremium: { // Helper flag to quickly check if the sharing is under premium benefits
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index to prevent sharing the same document with the same user multiple times
sharedDocumentSchema.index({ documentId: 1, sharedWith: 1 }, { unique: true });

const SharedDocument = mongoose.model('SharedDocument', sharedDocumentSchema);

module.exports = SharedDocument;
