// UserController.js

const User = require('../models/UserModel'); // Assuming you have a UserModel in your models directory

// Register a new user
exports.registerUser = async (req, res) => {
    try {
        // Logic for registering a user
        const user = new User(req.body);
        await user.save();
        res.status(201).send({ user });
    } catch (error) {
        res.status(400).send(error);
    }
};

// Login a user
exports.loginUser = async (req, res) => {
    try {
        // Logic for user login
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken(); // Assuming your User model has a method for JWT token generation
        res.send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        // The user's ID is attached to the request in the authentication middleware
        const user = await User.findById(req.user.id).select('-password'); // Exclude password from the result
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// Other controller methods like getUser, updateUser, deleteUser, etc.
