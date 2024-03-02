const Notification = require('../models/Notification');
const User = require('../models/UserModel');
const Document = require('../models/Document');
const SharedDocument = require('../models/SharedDocument');
const LinkedAccount = require('../models/LinkedAccount');
const Locker = require('../models/Locker');

const createNotification = async (userId, message, type, associatedId = null, onModel = null) => {
  const newNotification = new Notification({
    userId,
    message,
    type,
    associatedId,
    onModel,
    isRead: false
  });
  await newNotification.save();
};

const getLockerNameFromDocumentId = async (documentId) => {
    const document = await Document.findById(documentId).populate('lockerId');
    return document && document.lockerId ? document.lockerId.lockerName : null;
};
  
  


exports.notifyAccountCreation = async (userId) => {
    const message = "Welcome to our service! Your account has been successfully created.";
    await createNotification(userId, message, "custom");
};
  

exports.notifyDocumentUploaded = async (userId, documentId, lockerName) => {
    // Assuming the document exists as it has just been uploaded
    const document = await Document.findById(documentId);
    
    // Construct the message for the notification
    const message = `Your document "${document.title}" has been uploaded to locker: ${lockerName}.`;

    // Create and send the notification
    await createNotification(userId, message, "document_uploaded", documentId, "Document");
};

  

exports.notifyDocumentDeleted = async (userId, documentName) => {
    const message = `Your document "${documentName}" has been successfully deleted.`;
    await createNotification(userId, message, "custom");
};
  

exports.notifyDocumentShared = async (userId, documentId) => {
    const user = await User.findById(userId);
    if (!user.isPremium) {
      console.log("Document sharing notification is for premium users only.");
      return;
    }
  
    const sharedDocument = await Document.findById(documentId);
    if (!sharedDocument) {
      console.error("Shared document not found.");
      return;
    }
    
    const message = `A document "${sharedDocument.title}" has been shared with you.`;
    await createNotification(userId, message, "document_shared", documentId, "Document");
};
  

const createNotificationForMultipleUsers = async (userIds, message, type, associatedId = null, onModel = null) => {
    const notifications = userIds.map(userId => ({
      userId,
      message,
      type,
      associatedId,
      onModel,
      isRead: false
    }));
    await Notification.insertMany(notifications);
};



// Utility function to retrieve admin and linked account IDs
const getAdminAndLinkedAccountIds = async (adminId) => {
    const linkedAccountsRecord = await LinkedAccount.findOne({ UserId: adminId });
    const linkedUserIds = linkedAccountsRecord ? linkedAccountsRecord.linkedUsers.map(account => account.accountId.toString()) : [];
    return [adminId, ...linkedUserIds];
};

// Function to notify about document actions performed by the admin
exports.notifyDocumentActionByAdmin = async (adminId, documentId, action) => {
    const admin = await User.findById(adminId);
    const document = await Document.findById(documentId);
    if (!admin || !document) {
        console.error("Admin or Document not found.");
        return;
    }

    // Retrieve the locker's name using the helper function
    const lockerName = await getLockerNameFromDocumentId(documentId);
    if (!lockerName) {
        console.error("Locker not found for the document.");
        return;
    }

    const actionVerb = action === 'upload' ? 'uploaded' : action === 'delete' ? 'deleted' : 'shared';
    const adminName = `${admin.firstName} ${admin.lastName}`;
    const message = `Document "${document.title}" has been successfully ${actionVerb} by ${adminName} in locker: ${lockerName}.`;

    const userIds = await getAdminAndLinkedAccountIds(adminId);
    await createNotificationForMultipleUsers(userIds, message, "custom", documentId, "Document");
};



const checkLinkedAccountPermissions = async (adminUserId, linkedAccountId) => {
    // Initialize permissions object with default values
    const permissions = { upload: false, delete: false };

    // Find the linked accounts document for the admin user
    const linkedAccountsDoc = await LinkedAccount.findOne({ UserId: adminUserId });
    if (!linkedAccountsDoc) {
        console.error('No linked accounts found for this admin user.');
        return permissions; // Return default permissions if no linked accounts document is found
    }

    // Find the specific linked account within the linkedUsers array
    const linkedUser = linkedAccountsDoc.linkedUsers.find(user => 
        user.accountId.toString() === linkedAccountId.toString());

    if (!linkedUser) {
        console.error('Linked account not found within admin’s linked accounts.');
        return permissions; // Return default permissions if the linked account is not found
    }

    // Update permissions based on the linked account's permissions array
    permissions.upload = linkedUser.permissions.includes('upload');
    permissions.delete = linkedUser.permissions.includes('delete');

    return permissions;
};





const getAdminUserIdForLinkedAccount = async (linkedAccountId) => {
    // This function finds the admin user ID associated with a linked account
    const linkedAccount = await LinkedAccount.findOne({ "linkedUsers.accountId": linkedAccountId });
    return linkedAccount ? linkedAccount.UserId : null;
};

exports.notifyDocumentActionByLinkedAccount = async (linkedAccountId, documentId, action) => {
    const linkedAccount = await User.findById(linkedAccountId);
    const document = await Document.findById(documentId);
    if (!linkedAccount || !document) {
        console.error("Linked account or Document not found.");
        return;
    }
    
    // Find the admin user ID associated with this linked account
    const adminUserId = await getAdminUserIdForLinkedAccount(linkedAccountId);
    if (!adminUserId) {
        console.error("Admin user for linked account not found.");
        return;
    }

    // Check permissions for the linked account
    const permissions = await checkLinkedAccountPermissions(adminUserId, linkedAccountId);

    // Retrieve all userIds to notify (admin + linked accounts)
    const userIdsToNotify = await getAdminAndLinkedAccountIds(adminUserId);

    // Determine the action and check if the linked account has the required permission
    const actionVerb = action === 'upload' ? 'uploaded' : 'deleted';
    if ((action === 'upload' && permissions.upload) || (action === 'delete' && permissions.delete)) {
        const message = `Document "${document.title}" has been ${actionVerb} by ${linkedAccount.firstName} ${linkedAccount.lastName}.`;
        await createNotificationForMultipleUsers(userIdsToNotify, message, "custom", documentId, "Document");
    } else {
        // No permissions to perform the action, so do not send any notification
        console.log(`Linked account ${linkedAccount.firstName} ${linkedAccount.lastName} does not have permission to ${action}.`);
    }
};
