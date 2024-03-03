const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return !this.dummyUserId; }, // Required if dummyUserId is not provided
  },
  dummyUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DummyUser',
    required: function() { return !this.userId; }, // Required if userId is not provided
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
  associatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'onModel',
    required: false
  },
  onModel: {
    type: String,
    required: false,
    enum: ['TransactionLogs', 'SharedDocument', 'UserDocument', 'Custom']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Enable timestamps
  toJSON: { virtuals: true }, // Include virtuals when document is converted to JSON
  toObject: { virtuals: true } // Include virtuals when document is converted to an object
});

// Virtual property to identify the user type (Admin or Dummy) associated with the notification
notificationSchema.virtual('notifierType').get(function() {
  return this.userId ? 'Admin' : 'Dummy';
});

// Static method to find notifications by admin user ID
notificationSchema.statics.findByUserId = function(userId) {
  return this.find({ userId });
};

// Static method to find notifications by dummy user ID
notificationSchema.statics.findByDummyUserId = function(dummyUserId) {
  return this.find({ dummyUserId });
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
