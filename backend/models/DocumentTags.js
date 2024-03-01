const mongoose = require('mongoose');

const documentTagsSchema = new mongoose.Schema({
  tagName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const DocumentTags = mongoose.model('DocumentTags', documentTagsSchema);

module.exports = DocumentTags;
