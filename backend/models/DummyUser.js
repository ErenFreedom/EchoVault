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
  middleName: {
    type: String,
    trim: true,
    default: "",
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
  phoneNumber: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'others'],
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
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
  dateOfBirth: {
    type: Date,
  },
  profilePicture: {
    type: String,
    default: "",
  },
  occupationStatus: {
    type: String,
    enum: ['working', 'student', 'unemployed', 'other'],
    default: 'other',
  },
  // Integrated permissions structure as an array of permissionSchema
  permissions: [permissionSchema],
  linkedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  refreshToken: {
    type: String,
    default: "",
  },
  loggedIn: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

const DummyUser = mongoose.model('DummyUser', dummyUserSchema);

module.exports = DummyUser;
