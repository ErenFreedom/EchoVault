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
  accessFee: { 
    type: Number,
    default: 0
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransactionLogs',
    default: null
  },
  isOwnerPremium: { 
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

sharedDocumentSchema.index({ documentId: 1, sharedWith: 1 }, { unique: true });

const SharedDocument = mongoose.model('SharedDocument', sharedDocumentSchema);

module.exports = SharedDocument;
