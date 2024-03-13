const multer = require('multer');
const path = require('path');
const UserModel = require('../models/UserModel');
const DummyUser = require('../models/DummyUser');
const Lockers = require('../models/Lockers');
 // Import necessary models

// Set up storage options for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Replace 'uploads/' with your desired upload directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

// Initialize multer with the storage configuration and file size limit
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
  fileFilter: function (req, file, cb) {
    const fileTypes = /jpeg|jpg|png|gif|pdf/;
    const mimeType = fileTypes.test(file.mimetype);
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimeType && extName) {
      return cb(null, true);
    } else {
      cb('Error: File upload only supports the following filetypes - ' + fileTypes);
    }
  }
}).single('document'); // 'document' is the field name in the form

// Middleware to check if user has permission to upload to the specified locker
const checkUploadPermission = async (req, res, next) => {
    const lockerId = req.body.lockerId;
    const userId = req.user._id;
  
    try {
      const locker = await Lockers.findById(lockerId);
      if (!locker) {
        return res.status(404).json({ message: 'Locker not found.' });
      }
  
      // Assuming `User` schema has an `isPremium` field
      const user = await UserModel.findById(userId);
      const isOwner = user && locker.userId.equals(userId);
      const isPremium = user && user.isPremium;
  
      // If the user is the owner or a premium user, they have upload permissions by default
      if (isOwner || isPremium) {
        return next();
      }
  
      // If it's a dummy user, check specific permissions in the locker
      if (!user) {
        const dummyUser = await DummyUser.findById(userId);
        const canUpload = dummyUser && locker.dummyUserIds.some(dummyId => dummyId.equals(userId) && dummyUser.permissions.includes('upload'));
  
        if (!canUpload) {
          return res.status(403).json({ message: 'You do not have permission to upload documents to this locker.' });
        }
      }
  
      next();
    } catch (error) {
      res.status(500).json({ message: 'Failed to check upload permission.', error: error.toString() });
    }
  };
  
module.exports = {
  upload,
  checkUploadPermission
};
