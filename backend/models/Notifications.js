const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['transaction_success', 'document_shared', 'document_uploaded', 'custom'],
    default: 'custom'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  associatedId: { // Optional: Can link to the document or transaction related to the notification
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'onModel',
    required: false
  },
  onModel: { // This property is used to determine the model for population if associatedId is used
    type: String,
    required: false,
    enum: ['TransactionLogs', 'SharedDocument', 'UserDocument', 'Custom']
  },
  createdAt: {
    type: Date,
    default: Date.now // Auto-generate creation timestamp
  }
}, {
  timestamps: false // Disable Mongoose's built-in handling of timestamps (createdAt and updatedAt)
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
