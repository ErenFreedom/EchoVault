const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        user = new User({
            username,
            email,
            password: hashedPassword,
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            message: 'User registered successfully',
            token,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            message: 'User logged in successfully',
            token,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

exports.requestLockerAccess = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    otpStorage.set(email, otp);
    setTimeout(() => otpStorage.delete(email), 60000);

    try {
        await EmailService.sendEmail({
            to: email,
            subject: 'Your OTP',
            text: `Your OTP is: ${otp}`
        });

        res.status(200).json({ message: 'OTP sent to your email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending OTP' });
    }
};

// Verify OTP for locker access
exports.verifyLockerOtp = async (req, res) => {
    const { email, otp } = req.body;

    const correctOtp = otpStorage.get(email);
    if (otp === correctOtp) {
        otpStorage.delete(email);

        const user = await User.findOne({ email });
        const token = generateToken(user._id);

        res.status(200).json({
            message: 'OTP verified successfully',
            token,
        });
    } else {
        res.status(400).json({ message: 'Invalid OTP or OTP expired' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    requestLockerAccess,
    verifyLockerOtp
};