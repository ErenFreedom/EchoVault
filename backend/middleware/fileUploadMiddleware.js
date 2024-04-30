const multer = require('multer');
const path = require('path');
const UserModel = require('../models/UserModel');
const DummyUser = require('../models/DummyUser');
const Lockers = require('../models/Lockers');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});


const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, 
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
}).single('document'); 

const checkUploadPermission = async (req, res, next) => {
    const lockerId = req.body.lockerId;
    const userId = req.user._id;
  
    try {
      const locker = await Lockers.findById(lockerId);
      if (!locker) {
        return res.status(404).json({ message: 'Locker not found.' });
      }
  
      const user = await UserModel.findById(userId);
      const isOwner = user && locker.userId.equals(userId);
      const isPremium = user && user.isPremium;
  
      
      if (isOwner || isPremium) {
        return next();
      }
  
     
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
