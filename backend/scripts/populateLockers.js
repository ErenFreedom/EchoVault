const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/UserModel'); // Update the path to your User model
const Locker = require('../models/Lockers'); // Update the path to your Locker model

const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const lockerTypes = [
  'Personal',
  'Medical',
  'Finance',
  'Education',
  'Job-Related',
  'Identity Card',
  'Property',
  'Travel',
  'Legal',
  'Custom'
];

const createLockersForUsers = async () => {
  try {
    const users = await User.find({}); // Fetch all users or adjust query to match specific criteria

    for (let user of users) {
      const userLockers = lockerTypes.map(type => ({
        lockerName: `${type} Locker`, // Default name format; can be customized by the user later
        lockerType: type,
        userId: user._id, // Associate each locker with the current user
      }));

      await Locker.insertMany(userLockers); // Insert the lockers for the current user
    }

    console.log('Default lockers created for all users successfully!');
  } catch (error) {
    console.error('Error creating default lockers:', error.message);
  } finally {
    mongoose.disconnect();
  }
};

createLockersForUsers();
