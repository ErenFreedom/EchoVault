const mongoose = require('mongoose');

const tempDummyUserSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    age: { type: Number, min: 0 },
    gender: { type: String, enum: ['male', 'female', 'others'] },
    email: { type: String, required: true, unique: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    linkedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now, expires: '10m' }, 
}, {
    timestamps: true,
});

const TempDummyUser = mongoose.model('TempDummyUser', tempDummyUserSchema);
module.exports = TempDummyUser;
