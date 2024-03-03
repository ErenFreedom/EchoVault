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
    ref: 'UserModel', // Reference to the owner (admin) user
    required: true
  },
  dummyUserIds: [{ // New field for referencing DummyUser IDs
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DummyUser' // Reference to DummyUser who have access
  }],
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
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

// Index to prevent users from creating multiple lockers with the same name
lockerSchema.index({ lockerName: 1, userId: 1 }, { unique: true });

const Locker = mongoose.model('Locker', lockerSchema);

module.exports = Locker;
