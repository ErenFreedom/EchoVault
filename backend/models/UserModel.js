const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
    enum: ['working', 'student', 'unemployed', 'other'], // Added 'unemployed' and 'other' to cover more options
    default: 'other' // Optional: you can set a default or leave it undefined
  },
  
  // Add any other user fields here
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
