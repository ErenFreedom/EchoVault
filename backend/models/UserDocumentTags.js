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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  documents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document'
    }
  ],
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
