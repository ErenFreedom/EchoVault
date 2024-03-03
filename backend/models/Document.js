const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: function() { return !this.dummyUserId; }, // Required if dummyUserId is not provided
    ref: 'User'
  },
  dummyUserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: function() { return !this.userId; }, // Required if userId is not provided
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
  encryptionKey: {
    type: String,
    required: true
  },
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
  toJSON: { virtuals: true }, // Ensure virtuals are included when document is converted to JSON
  toObject: { virtuals: true } // Ensure virtuals are included when document is converted to a JavaScript object
});

// Virtual property to identify the document owner type
documentSchema.virtual('ownerType').get(function() {
  return this.userId ? 'Admin User' : 'Dummy User';
});

// Static method to fetch documents by admin user ID
documentSchema.statics.findByAdminUserId = function(adminUserId, callback) {
  return this.find({ userId: adminUserId }, callback);
};

// Static method to fetch documents by dummy user ID
documentSchema.statics.findByDummyUserId = function(dummyUserId, callback) {
  return this.find({ dummyUserId: dummyUserId }, callback);
};

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
