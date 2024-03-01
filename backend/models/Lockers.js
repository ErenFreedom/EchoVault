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
      'Job-Related', 
      'Identity Card', 
      'Property', 
      'Travel', 
      'Legal', 
      'Custom' // Custom type for premium users
    ],
    default: 'Custom'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  isPremium: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Include any other locker-specific features or limitations here
  features: {
    type: Map,
    of: String
  }
}, {
  timestamps: true // This will add createdAt and updatedAt timestamps
});

// Index to prevent users from creating multiple lockers with the same name
lockerSchema.index({ lockerName: 1, userId: 1 }, { unique: true });

const Locker = mongoose.model('Locker', lockerSchema);

module.exports = Locker;
