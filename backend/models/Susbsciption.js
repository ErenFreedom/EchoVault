const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  planName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    // Duration could be in days, months, etc.
    // Assuming this is the number of months the subscription is active
  },
  features: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  storageLimit: {
    type: Number,
    required: true
  },
  fileSizeLimit: {
    type: Number,
    required: true
  },
  lockerLimit: {
    type: Number,
    required: true
  },
  premiumFeatures: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
