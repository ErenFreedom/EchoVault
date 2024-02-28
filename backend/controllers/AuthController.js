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
