// UserController.js

const User = require('../models/UserModel'); // Assuming you have a UserModel in your models directory

// Register a new user
exports.register = async (req, res) => {
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
exports.login = async (req, res) => {
    try {
        // Logic for user login
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken(); // Assuming your User model has a method for JWT token generation
        res.send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
};

// Other controller methods like getUser, updateUser, deleteUser, etc.
