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
  }],
  accountLinkingLimit: {
    type: Number,
    default: 0 
  }
}, {
  timestamps: true
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
