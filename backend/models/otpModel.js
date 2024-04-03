const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '1m' } // OTP expires after 1 minute
});

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
