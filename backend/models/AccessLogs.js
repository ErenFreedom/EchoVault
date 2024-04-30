const mongoose = require('mongoose');

const accessLogsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return !this.dummyUserId; } 
  },
  dummyUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DummyUser',
    required: function() { return !this.userId; } 
  },
  actionType: {
    type: String,
    required: true,
    trim: true,
    enum: ['login', 'logout', 'create', 'read', 'update', 'delete', 'download', 'share', 'other'] 
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
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
    enum: ['success', 'failure', 'error'] 
  }
}, {
  timestamps: { createdAt: 'timestamp', updatedAt: false } 
});



accessLogsSchema.virtual('userType').get(function() {
  return this.userId ? 'Normal User' : 'Dummy User';
});

accessLogsSchema.statics.findByUserId = function(userId) {
  return this.find({ userId: userId });
};

accessLogsSchema.statics.findByDummyUserId = function(dummyUserId) {
  return this.find({ dummyUserId: dummyUserId });
};

const AccessLog = mongoose.model('AccessLog', accessLogsSchema);

module.exports = AccessLog;
