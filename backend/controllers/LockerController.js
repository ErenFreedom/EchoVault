const Locker = require('../models/Lockers');
const User = require('../models/UserModel'); 
const DummyUser = require('../models/DummyUser');

// Function to create a new locker
exports.createLocker = async (req, res) => {
  const { lockerName, lockerType } = req.body;
  const userId = req.user._id; 

  try {
      
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found.' });
      }

      if (!user.isPremium) {
          return res.status(403).json({ message: 'Only premium users can create custom lockers.' });
      }

      
      const existingLocker = await Locker.findOne({ lockerName, userId });
      if (existingLocker) {
          return res.status(400).json({ message: 'A locker with this name already exists.' });
      }

     
      const locker = new Locker({
          lockerName,
          lockerType,
          userId: userId, 
      });

      await locker.save();

      res.status(201).json({ message: 'Locker created successfully.', locker: locker });
  } catch (error) {
      console.error('Error creating locker: ', error);
      res.status(500).json({ message: 'Error creating locker.', error: error.message });
  }
};



exports.getUserLockers = async (req, res) => {
  try {
      
      const userId = req.user._id;
      const lockers = await Locker.find({ userId }).lean();
      res.json(lockers);
  } catch (error) {
      console.error('Error fetching user lockers:', error);
      res.status(500).json({ message: 'Failed to fetch user lockers', error: error.message });
  }
};


exports.grantPermissionsToDummyUser = async (req, res) => {
    const { lockerId, dummyUserId, permissions } = req.body;
    const { userId } = req; 
  
    try {
      
      const user = await User.findById(userId);
      if (!user || !user.isPremium) {
        return res.status(403).json({ message: 'Only premium users can grant permissions.' });
      }
  
      
      const dummyUser = await DummyUser.findById(dummyUserId);
      if (!dummyUser) {
        return res.status(404).json({ message: 'Dummy user not found.' });
      }
  
     
      const locker = await Locker.findById(lockerId);
      if (!locker || !locker.userId.equals(userId)) {
        return res.status(404).json({ message: 'Locker not found or you do not have permission to modify it.' });
      }
  
      
      const existingPermissionIndex = locker.permissions.findIndex(p => p.dummyUserId.equals(dummyUserId));
      if (existingPermissionIndex > -1) {
        
        locker.permissions[existingPermissionIndex].allowedActions = permissions;
      } else {
        
        locker.permissions.push({ dummyUserId, allowedActions: permissions });
      }
  
      await locker.save();
  
      res.json({ message: 'Permissions updated successfully.' });
    } catch (error) {
      console.error('Error updating permissions: ', error);
      res.status(500).json({ message: 'Failed to update permissions.', error: error.message });
    }
  };

  