const mongoose = require('mongoose');

// Define a sub-schema for permissions associated with a locker
const permissionSchema = new mongoose.Schema({
  lockerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Locker' // Adjust this to the name of your Locker model if you have one
  },
  permissions: [{
    type: String,
    enum: ['upload', 'delete', 'view'], // Specify the permissions you need
  }]
}, { _id: false }); // Prevent mongoose from automatically adding an _id field to these sub-documents

// Main DummyUser schema
const dummyUserSchema = new mongoose.Schema({
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
  isGuestUser: { // Adding a flag to explicitly mark as a guest user
    type: Boolean,
    required: true,
    default: true // Default to true as this model is for DummyUsers only
  },
  permissions: [permissionSchema],
  linkedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Adjust this to match the name of your User model
    required: true,
  },
  verified: {
    type: Boolean,
    default: false, // Tracks if the user's email has been verified
  }
}, {
  timestamps: true, // Keeps track of user creation and update times
});

const DummyUser = mongoose.model('DummyUser', dummyUserSchema);

module.exports = DummyUser;
