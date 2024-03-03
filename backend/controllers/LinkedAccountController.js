const LinkedAccount = require('../models/LinkedAccount');
const User = require('../models/UserModel');
const Document = require('../models/Document');
const Notification = require('../models/Notification');
const SharedDocument = require('../models/SharedDocument');
const createError = require('http-errors');
require('dotenv').config();

const DOCUMENT_LIMIT_NORMAL_USER = parseInt(process.env.DOCUMENT_LIMIT_NORMAL_USER, 10);
const MAX_SIZE_MB_NORMAL_USER = parseInt(process.env.MAX_SIZE_MB_NORMAL_USER, 10);
const MAX_SIZE_MB_PREMIUM_USER = parseInt(process.env.MAX_SIZE_MB_PREMIUM_USER, 10);
// Split the ALLOWED_FORMATS string by commas and trim whitespace
const ALLOWED_FORMATS = process.env.ALLOWED_FORMATS.split(',').map(format => format.trim());

// The rest of your LockerController logic...


// Helper function to determine if a user is under the age of 13
const isUnderage = (dateOfBirth) => {
  const today = new Date();
  const ageLimitDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
  return dateOfBirth > ageLimitDate; // true if under 13, false otherwise
};

exports.linkAccount = async (req, res, next) => {
  try {
    const { linkedUserId } = req.body;

    // Ensure the linked account exists
    const linkedUser = await User.findById(linkedUserId);
    if (!linkedUser) {
      throw createError(404, 'Linked account not found.');
    }

    // Check if the linked user is under the age of 13
    if (isUnderage(linkedUser.dateOfBirth)) {
      throw createError(403, 'Cannot link accounts for users under the age of 13.');
    }

    // Fetch or create the LinkedAccount document for the current user (admin)
    let linkedAccount = await LinkedAccount.findOne({ UserId: req.user._id });
    if (!linkedAccount) {
      linkedAccount = new LinkedAccount({ UserId: req.user._id });
    }

    // Add the linked user account
    linkedAccount.linkedUsers.push({
      accountId: linkedUserId,
      isVerified: true, // Assume verification for the sake of this example
    });

    await linkedAccount.save();
    res.status(201).json({ message: 'Account linked successfully', linkedAccount });
  } catch (error) {
    next(error);
  }
};

exports.setAccessForLinkedAccount = async (req, res, next) => {
  try {
    const { linkedUserId, canUpload, canDelete, canView } = req.body;

    // Admin can only set access controls
    if (!req.user.isAdmin) {
      throw createError(403, 'Only admin can set access controls.');
    }

    // Ensure the linked user is not underage
    const linkedUser = await User.findById(linkedUserId);
    if (isUnderage(linkedUser.dateOfBirth)) {
      throw createError(403, 'Access controls cannot be set for users under the age of 13.');
    }

    // Update access controls
    await LinkedAccount.updateOne(
      { 'linkedUsers.accountId': linkedUserId },
      { $set: { 'linkedUsers.$.canUpload': canUpload, 'linkedUsers.$.canDelete': canDelete, 'linkedUsers.$.canView': canView } }
    );

    res.status(200).json({ message: 'Access controls updated successfully' });
  } catch (error) {
    next(error);
  }
};
exports.shareWith = async (req, res, next) => {
    try {
      if (!req.user.isAdmin) {
        throw createError(403, "Only admins can share documents.");
      }
  
      const { documentId, sharedWithId } = req.body;
  
      // Ensure the recipient exists and is an admin
      const recipientAdmin = await User.findOne({ _id: sharedWithId, isAdmin: true });
      if (!recipientAdmin) {
        throw createError(404, "Recipient admin not found or is not an admin.");
      }
  
      // Optionally, verify the document exists and is owned by the admin sharing it
      const document = await Document.findById(documentId);
      if (!document) {
        throw createError(404, "Document not found.");
      }
      if (document.userId.toString() !== req.user._id.toString()) {
        throw createError(403, "You do not have permission to share this document.");
      }
  
      // Create a new SharedDocument entry
      const newSharedDocument = new SharedDocument({
        documentId,
        userId: req.user._id, // The owner/admin sharing the document
        sharedWith: [sharedWithId], // The recipient admin
        ownerSubscriptionStatus: req.user.isPremium ? 'premium' : 'normal',
        isOwnerPremium: req.user.isPremium,
      });
  
      await newSharedDocument.save();
  
      // Send a notification to the recipient admin
      const notification = new Notification({
        userId: sharedWithId,
        message: `A new document has been shared with you: ${document.title}`,
        type: 'document_shared',
        associatedId: document._id,
        onModel: 'Document',
      });
  
      await notification.save();
      res.status(200).json({ message: 'Document shared successfully and notification sent.', sharedDocument: newSharedDocument });
    } catch (error) {
      // Unique index violation check
      if (error.code === 11000) {
        return next(createError(409, "Document has already been shared with this user."));
      }
      next(error);
    }
};
// ... Other methods to handle linking additional accounts, sharing documents, etc. ...

module.exports={
  linkAccount,
  setAccessForLinkedAccount,
  shareWith
}