const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1, // Assuming the rating is on a scale from 1 to 5
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // You can include a response to feedback if needed
  response: {
    content: String,
    respondedAt: Date,
    responderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true // This will add both createdAt and updatedAt timestamps
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
