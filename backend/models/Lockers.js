const mongoose = require('mongoose');

const lockerSchema = new mongoose.Schema({
  lockerName: {
    type: String,
    required: true,
    trim: true
  },
  lockerType: {
    type: String,
    required: true,
    enum: [
      'Personal', 
      'Medical', 
      'Finance', 
      'Education', 
      'Property', 
      'Travel', 
      'Legal', 
      'Custom' 
    ],
  },
  userId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  }],
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  permissions: [{
    dummyUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DummyUser'
    },
    allowedActions: [String] 
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  features: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});


lockerSchema.index({ lockerName: 1, userId: 1 }, { unique: true });

const Locker = mongoose.model('Locker', lockerSchema);

module.exports = Locker;
