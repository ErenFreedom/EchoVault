const mongoose = require('mongoose');

const identityProofsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  proofType: {
    type: String,
    required: true,
    trim: true
  },
  proofNumber: {
    type: String,
    required: true,
    trim: true
  },
  documentIds: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Documents'
  }]
}, {
  timestamps: true
});

identityProofsSchema.index({ userId: 1, proofType: 1, proofNumber: 1 }, { unique: true });

const IdentityProofs = mongoose.model('IdentityProofs', identityProofsSchema);

module.exports = IdentityProofs;
