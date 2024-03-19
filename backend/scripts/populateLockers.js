const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/UserModel'); // Ensure correct path
const Locker = require('../models/Lockers'); // Ensure correct path

const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const lockerTypes = [
  'Personal',
  'Medical',
  'Finance',
  'Education',
  'Property',
  'Travel',
  'Legal',
];

const createLockersForUsers = async () => {
  try {
    // Fetch all users
    const users = await User.find({});
    
    // Iterate over each user to create default lockers
    for (const user of users) {
      const userLockers = lockerTypes.map(lockerType => ({
        lockerName: `${lockerType} Locker`,
        lockerType,
        userId: user._id, // Assign the locker to the current user
      }));

      // Create lockers for the current user
      await Locker.insertMany(userLockers);
    }

    console.log('Default lockers created for all users successfully!');
  } catch (error) {
    console.error('Error creating default lockers:', error);
  } finally {
    mongoose.disconnect();
  }
};

createLockersForUsers();
