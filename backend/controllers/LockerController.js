const Locker = require('../models/Locker');
const User = require('../models/UserModel'); // Adjust based on your actual User model's name
const DummyUser = require('../models/DummyUser');

// Function to create a new locker
exports.createLocker = async (req, res) => {
    const { userId, lockerName, lockerType } = req.body;

    try {
        // Check if the user is premium
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (!user.isPremium) {
            return res.status(403).json({ message: 'Only premium users can create custom lockers.' });
        }

        // Check for existing locker with the same name
        const existingLocker = await Locker.findOne({ lockerName, userId });
        if (existingLocker) {
            return res.status(400).json({ message: 'A locker with this name already exists.' });
        }

        // Create the new locker
        const locker = new Locker({
            lockerName,
            lockerType,
            userId: userId, // Assigning the locker to the user
            // dummyUserIds will be empty initially. Assign dummy users to the locker in a separate functionality
        });

        await locker.save();

        res.status(201).json({ message: 'Locker created successfully.', locker: locker });
    } catch (error) {
        console.error('Error creating locker: ', error);
        res.status(500).json({ message: 'Error creating locker.', error: error.message });
    }
};


exports.grantPermissionsToDummyUser = async (req, res) => {
    const { lockerId, dummyUserId, permissions } = req.body;
    const { userId } = req; // Assuming the userId is extracted from JWT token or session
  
    try {
      // Verify the user is premium
      const user = await User.findById(userId);
      if (!user || !user.isPremium) {
        return res.status(403).json({ message: 'Only premium users can grant permissions.' });
      }
  
      // Verify the dummy user exists
      const dummyUser = await DummyUser.findById(dummyUserId);
      if (!dummyUser) {
        return res.status(404).json({ message: 'Dummy user not found.' });
      }
  
      // Verify the locker exists and belongs to the user
      const locker = await Locker.findById(lockerId);
      if (!locker || !locker.userId.equals(userId)) {
        return res.status(404).json({ message: 'Locker not found or you do not have permission to modify it.' });
      }
  
      // Update or set permissions for the dummy user in this locker
      const existingPermissionIndex = locker.permissions.findIndex(p => p.dummyUserId.equals(dummyUserId));
      if (existingPermissionIndex > -1) {
        // Update existing permissions
        locker.permissions[existingPermissionIndex].allowedActions = permissions;
      } else {
        // Add new permissions
        locker.permissions.push({ dummyUserId, allowedActions: permissions });
      }
  
      await locker.save();
  
      res.json({ message: 'Permissions updated successfully.' });
    } catch (error) {
      console.error('Error updating permissions: ', error);
      res.status(500).json({ message: 'Failed to update permissions.', error: error.message });
    }
  };

  module.exports={
    createLocker,
    grantPermissionsToDummyUser
  }