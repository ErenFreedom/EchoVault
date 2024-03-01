const mongoose = require('mongoose');

const accessLogsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  actionType: {
    type: String,
    required: true,
    trim: true,
    enum: ['login', 'logout', 'create', 'read', 'update', 'delete', 'download', 'share', 'other'] // Add more action types as necessary
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Additional fields
  ipAddress: {
    type: String,
    trim: true
  },
  deviceInfo: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  outcome: {
    type: String,
    trim: true,
    enum: ['success', 'failure', 'error'] // Represents the outcome of the action
  }
}, {
  timestamps: { createdAt: 'timestamp', updatedAt: false } // Only log the creation time
});

const AccessLog = mongoose.model('AccessLog', accessLogsSchema);

module.exports = AccessLog;
