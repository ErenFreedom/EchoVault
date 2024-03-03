const mongoose = require('mongoose');

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
    default: 'other'
  },
  permissions: {
    type: [String],
    enum: ['upload', 'delete', 'view'], // Add any other permissions as necessary
    default: []
  },
  // Reference to the main account (User) that this dummy account is linked to
  linkedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const DummyUser = mongoose.model('DummyUser', dummyUserSchema);

module.exports = DummyUser;
