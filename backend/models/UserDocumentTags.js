const mongoose = require('mongoose');

const userDocumentTagsSchema = new mongoose.Schema({
  tagName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  // A reference to User who owns this tag
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  // Documents that are associated with this tag
  documents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document'
    }
  ],
  // Parent tag to allow hierarchical structuring of tags
  parentTag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserDocumentTags',
    default: null
  }
}, {
  timestamps: true
});

const UserDocumentTags = mongoose.model('UserDocumentTags', userDocumentTagsSchema);

module.exports = UserDocumentTags;
