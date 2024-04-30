const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  lockerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Locker' 
  },
  permissions: [{
    type: String,
    enum: ['upload', 'delete', 'view'], 
  }]
}, { _id: false }); 

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
  isGuestUser: { 
    type: Boolean,
    required: true,
    default: true 
  },
  permissions: [permissionSchema],
  linkedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  verified: {
    type: Boolean,
    default: false, 
  }
}, {
  timestamps: true, 
});

const DummyUser = mongoose.model('DummyUser', dummyUserSchema);

module.exports = DummyUser;
