const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    min: 0,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'others'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  recovery_email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false // Tracks if the user's email has been verified
  }
}, {
  timestamps: true, // Keeps track of user creation and update times
});

const User = mongoose.model('User', userSchema);

module.exports = User;
