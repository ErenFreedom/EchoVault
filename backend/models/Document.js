const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: function() { return !this.dummyUserId; },
    ref: 'User'
  },
  dummyUserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: function() { return !this.userId; },
    ref: 'DummyUser'
  },
  lockerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Locker'
  },
  documentType: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
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
  // Removed the encryptionKey from being required in the document model
  uploadDate: {
    type: Date,
    default: Date.now
  },
  metaData: {
    type: Map,
    of: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

documentSchema.virtual('ownerType').get(function() {
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
