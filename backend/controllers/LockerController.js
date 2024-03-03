const Locker = require('../models/Locker');
const User = require('../models/User');
const Document = require('../models/Document');
const createError = require('http-errors');

// Constants for document restrictions
const DOCUMENT_LIMIT_NORMAL_USER = 10;
const MAX_SIZE_MB_NORMAL_USER = 25;
const MAX_SIZE_MB_PREMIUM_USER = 250;
const ALLOWED_FORMATS = ['pdf', 'jpeg', 'jpg']; // Extend this array as needed

exports.createLocker = async (req, res, next) => {
  try {
    const { lockerName, lockerType } = req.body;
    const { _id: userId, isPremium, isAdmin } = req.user;

    // Normal users cannot create custom lockers
    if (!isPremium && lockerType === 'Custom') {
      throw createError(403, "Only premium users can create custom lockers.");
    }

    // Check for existing locker with the same name for the user
    const existingLocker = await Locker.findOne({ lockerName, userId });
    if (existingLocker) {
      throw createError(400, "A locker with this name already exists.");
    }

    const newLocker = new Locker({
      lockerName,
      lockerType,
      userId,
      isPremium
    });
    await newLocker.save();

    res.status(201).json({ message: 'Locker created successfully', locker: newLocker });
  } catch (error) {
    next(error);
  }
};

exports.viewLockerAccessList = async (req, res, next) => {
  try {
    const { lockerId } = req.params;
    const { _id: userId, isPremium } = req.user;

    const locker = await Locker.findById(lockerId);
    if (!locker) {
      throw createError(404, "Locker not found.");
    }

    // Check if the current user is the owner of the locker
    if (!locker.userId.equals(userId)) {
      throw createError(403, "You do not have permission to view this locker's access list.");
    }

    // Access list for the owner
    let accessList = [{ username: req.user.username, accessType: 'Owner' }];

    // If the user is premium, include linked accounts in the access list
    if (isPremium) {
      // Assuming a LinkedAccount model exists that keeps track of which accounts are linked to a premium user
      const linkedAccounts = await LinkedAccount.find({ userId }).populate('linkedUsers.accountId', 'username');

      // Map over the linked accounts and add them to the access list
      const linkedUsersAccessList = linkedAccounts
        .flatMap(account => account.linkedUsers)
        .map(link => ({
          username: link.accountId.username, // assuming accountId is populated with the linked user's details
          accessType: 'Linked Account'
        }));

      accessList = accessList.concat(linkedUsersAccessList);
    }

    res.status(200).json({ lockerId: locker._id, accessList });
  } catch (error) {
    next(error);
  }
};






// Additional methods as needed...

module.exports={
  createLocker,
  
  

}
