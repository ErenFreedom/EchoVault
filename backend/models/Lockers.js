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
      'Custom' // Allow for custom locker types for premium users
    ],
  },
  userId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assume your User model is named 'User'
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
    allowedActions: [String] // e.g., ['upload', 'delete', 'download']
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

// Unique index to prevent duplicate lockers of the same name for a user
lockerSchema.index({ lockerName: 1, userId: 1 }, { unique: true });

const Locker = mongoose.model('Locker', lockerSchema);

module.exports = Locker;
