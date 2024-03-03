const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return !this.dummyUserId; } // Required if dummyUserId is not provided
  },
  dummyUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DummyUser',
    required: function() { return !this.userId; } // Required if userId is not provided
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  response: {
    content: String,
    respondedAt: Date,
    responderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual property to identify the type of user (Admin or Dummy) who submitted the feedback
feedbackSchema.virtual('submitterType').get(function() {
  return this.userId ? 'Admin' : 'Dummy';
});

// Static method to find feedback by admin user ID
feedbackSchema.statics.findByUserId = function(userId) {
  return this.find({ userId });
};

// Static method to find feedback by dummy user ID
feedbackSchema.statics.findByDummyUserId = function(dummyUserId) {
  return this.find({ dummyUserId });
};

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
