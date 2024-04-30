const mongoose = require('mongoose');
const User = require('../models/UserModel');
const connectDB = require('../config/database');

const users = [
    { username: 'johnDoe', email: 'john@example.com', password: 'password123' },
    { username: 'janeDoe', email: 'jane@example.com', password: 'password123' }
];

const seedUsers = async () => {
    try {
        await connectDB(); 
        await User.deleteMany(); 
        await User.insertMany(users);
        console.log('Users seeded successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();
