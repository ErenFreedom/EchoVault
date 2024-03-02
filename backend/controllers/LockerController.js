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

exports.addDocumentToLocker = async (req, res, next) => {
  try {
    const { lockerId, documentName, fileSizeMB, format } = req.body;
    const { _id: userId, isPremium } = req.user;

    if (!ALLOWED_FORMATS.includes(format)) {
      throw createError(400, `Invalid format. Allowed formats: ${ALLOWED_FORMATS.join(', ')}`);
    }

    const locker = await Locker.findById(lockerId);
    if (!locker) throw createError(404, 'Locker not found');
    if (locker.userId.toString() !== userId.toString()) throw createError(403, 'Not authorized to add documents to this locker');

    if (!isPremium && (fileSizeMB > MAX_SIZE_MB_NORMAL_USER || locker.documents.length >= DOCUMENT_LIMIT_NORMAL_USER)) {
      throw createError(400, 'Document limit or size exceeded for normal users');
    }

    if (isPremium && fileSizeMB > MAX_SIZE_MB_PREMIUM_USER) {
      throw createError(400, 'Document size exceeded for premium users');
    }

    // Assuming functionality to actually add the document to the locker here
    // This could involve creating a Document model instance and saving it, then updating the locker document list

    res.status(200).json({ message: 'Document added successfully to the locker' });
  } catch (error) {
    next(error);
  }
};

exports.shareDocument = async (req, res, next) => {
  try {
    const { documentId, recipientId } = req.body;
    const { _id: userId, isPremium } = req.user;

    if (!isPremium) {
      throw createError(403, 'Only premium users can share documents');
    }

    const recipientUser = await User.findById(recipientId);
    if (!recipientUser || !recipientUser.isPremium) {
      throw createError(400, 'Document can only be shared with another premium user');
    }

    // Logic to share the document, e.g., create a SharedDocument entry

    res.status(200).json({ message: 'Document shared successfully' });
  } catch (error) {
    next(error);
  }
};

// Additional methods as needed...
