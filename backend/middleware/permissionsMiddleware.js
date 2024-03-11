const Locker = require('../models/Locker');

// Middleware to check if a dummy user has permission for a specific action on a locker
const checkPermissionForDummy = async (req, res, next) => {
  const { lockerId } = req.params; // Or wherever the locker ID comes from in your request
  const userId = req.user._id; // Extracted from the JWT or session

  try {
    const locker = await Locker.findById(lockerId);
    if (!locker) {
      return res.status(404).json({ message: 'Locker not found.' });
    }

    // Check if the user is a dummy user linked to the locker and has required permissions
    const dummyPermission = locker.permissions.find(
      p => p.dummyUserId.toString() === userId.toString()
    );

    if (!dummyPermission) {
      return res.status(403).json({ message: 'No permissions assigned for this dummy user.' });
    }

    // Check for specific permissions. Example: 'upload', 'download', 'delete'
    const action = req.route.path.split('/').pop(); // Assuming route paths like '/upload', '/download', '/delete'
    if (!dummyPermission.allowedActions.includes(action)) {
      return res.status(403).json({ message: `Dummy user does not have permission to ${action} documents in this locker.` });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Failed to check dummy user permissions.', error: error.toString() });
  }
};

module.exports = {
  checkPermissionForDummy
};
