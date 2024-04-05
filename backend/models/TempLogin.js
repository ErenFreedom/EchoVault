const mongoose = require('mongoose');

const tempLoginSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // Expires in 5 minutes
  },
});

const TempLogin = mongoose.model('TempLogin', tempLoginSchema);

module.exports = TempLogin;
