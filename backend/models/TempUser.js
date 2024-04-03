const mongoose = require('mongoose');

const tempUserSchema = new mongoose.Schema({
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
    trim: true,
    default: "",
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
    trim: true,
  },
  recovery_email: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
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
    default: 'other'
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // this document will be automatically removed after 10 minutes
  }
}, {
  timestamps: true,
});

const TempUser = mongoose.model('TempUser', tempUserSchema);

module.exports = TempUser;
