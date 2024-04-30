const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false 
  },
  dummyUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DummyUser',
    required: false 
  },
  lockerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Locker'
  },
  documentType: {
    type: String,
    required: false, 
    trim: true
  },
  title: {
    type: String,
    required: false, 
    trim: true
  },
  fileName: {
    type: String,
    required: true, 
    trim: true
  },
  filePath: {
    type: String,
    required: true, 
    trim: true
  },
  thumbnailPath: {
    type: String,
    required: false, 
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  metaData: {
    type: Map,
    of: String,
    required: false // MetaData can be optional
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// The virtuals can remain as is if they're useful for your application logic
documentSchema.virtual('ownerType').get(function() {
  // This will simply return 'Admin User' if userId is present, else 'Dummy User'
  return this.userId ? 'Admin User' : 'Dummy User';
});

documentSchema.statics.findByAdminUserId = function(adminUserId, callback) {
  return this.find({ userId: adminUserId }, callback);
};

documentSchema.statics.findByDummyUserId = function(dummyUserId, callback) {
  return this.find({ dummyUserId: dummyUserId }, callback);
};

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
