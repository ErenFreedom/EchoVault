const Locker = require('../models/Lockers');

// Helper function to check permissions for dummy users
const checkPermissionForDummy = async (req, res, next, action) => {
    const { lockerId } = req.body; // Or wherever the locker ID comes from in your request
    const userId = req.user._id; // Extracted from the JWT or session
  
    try {
      const locker = await Locker.findById(lockerId);
      if (!locker) {
        return res.status(404).json({ message: 'Locker not found.' });
      }
  
      const dummyPermission = locker.permissions.find(
        p => p.dummyUserId.toString() === userId.toString()
      );
  
      if (!dummyPermission || !dummyPermission.allowedActions.includes(action)) {
        return res.status(403).json({ message: `No permissions for this action.` });
      }
  
      next();
    } catch (error) {
      res.status(500).json({ message: 'Failed to check permissions.', error: error.toString() });
    }
};

const checkUploadPermission = async (req, res, next) => {
    if (req.user.type === 'dummy') {
        return checkPermissionForDummy(req, res, next, 'upload');
    }
    next();
};

const checkDeletePermission = async (req, res, next) => {
    if (req.user.type === 'dummy') {
        return checkPermissionForDummy(req, res, next, 'delete');
    }
    next();
};

const checkDownloadPermission = async (req, res, next) => {
    if (req.user.type === 'dummy') {
        return checkPermissionForDummy(req, res, next, 'download');
    }
    next();
};

module.exports = {
    checkUploadPermission,
    checkDeletePermission,
    checkDownloadPermission
};
