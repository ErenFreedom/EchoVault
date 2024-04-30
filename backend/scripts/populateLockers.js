const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/UserModel'); 
const Locker = require('../models/Lockers'); 

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
    const users = await User.find({});
    
    for (const user of users) {
      const userLockers = lockerTypes.map(lockerType => ({
        lockerName: `${lockerType} Locker`,
        lockerType,
        userId: user._id, 
      }));

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
