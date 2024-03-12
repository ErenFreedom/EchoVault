const Notification = require('../models/Notification');
const User = require('../models/UserModel');
const DummyUser = require('../models/DummyUser');

// Utility function to check if a user is premium
async function isUserPremium(userId) {
    const user = await User.findById(userId);
    return user && user.isPremium;
}

// Utility function to check if a user is a guest user
async function isGuestUser(userId) {
    const dummyUser = await DummyUser.findById(userId);
    return !!dummyUser;
}

async function getUserPermissions(userId) {
    try {
        const guestUser = await DummyUser.findById(userId);
        if (!guestUser) {
            // Handle case where no guest user is found for the given ID
            console.log("No guest user found for the provided ID.");
            return { success: false, message: "Guest user not found.", permissions: [] };
        }
        // Assuming permissions are stored directly in the DummyUser document
        return { success: true, message: "Permissions fetched successfully.", permissions: guestUser.permissions };
    } catch (error) {
        // Handle any potential errors that may occur during database query
        console.error("Error fetching guest user permissions:", error);
        return { success: false, message: "Error fetching permissions.", permissions: [] };
    }
}


// General function to create a notification
const createNotification = async (userId, dummyUserId, message, type, associatedId = null) => {
    const newNotification = new Notification({
        userId,
        dummyUserId,
        message,
        type,
        associatedId,
    });
    await newNotification.save();
};

// Specific notification functions incorporating checks
// Notify document upload
exports.notifyDocumentUpload = async (userId, documentId) => {
    let canNotify = true; // Assume we can notify the user by default

    if (await isGuestUser(userId)) {
        const permissions = await getUserPermissions(userId);
        canNotify = permissions.includes('upload'); // Check if the guest user has 'upload' permission
    }

    if (canNotify) {
        const message = 'A new document has been uploaded.';
        const type = 'document_uploaded';
        await createNotification(userId, null, message, type, documentId);
    }
};

// Notify about document deletion with permission check for guest users
exports.notifyDocumentDeletion = async (userId, documentId) => {
    let canNotify = true;

    if (await isGuestUser(userId)) {
        const permissions = await getUserPermissions(userId);
        canNotify = permissions.includes('delete'); // Check if the guest user has 'delete' permission
    }

    if (canNotify) {
        const message = 'A document has been deleted.';
        const type = 'document_deleted';
        await createNotification(userId, null, message, type, documentId);
    }
};

// Notify about document download with permission check for guest users
exports.notifyDocumentDownload = async (userId, documentId) => {
    let canNotify = true;

    if (await isGuestUser(userId)) {
        const permissions = await getUserPermissions(userId);
        canNotify = permissions.includes('download'); // Assuming a permission for download, if applicable
    }

    if (canNotify) {
        const message = 'A document has been downloaded.';
        const type = 'document_downloaded';
        await createNotification(userId, null, message, type, documentId);
    }
};

// Notify premium purchase
exports.notifyPremiumPurchase = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        console.error("User not found for ID:", userId);
        return;
    }

    // Check if the user is already premium or is a guest user
    if (await isUserPremium(userId) || await isGuestUser(userId)) {
        console.log(`User ${userId} is already premium or is a guest user. No notification sent.`);
        return;
    }

    const message = 'Congratulations! You have successfully upgraded to PremiumLocker.';
    const type = 'premium_purchase';

    const newNotification = new Notification({
        userId,
        message,
        type,
    });

    await newNotification.save();
    console.log(`Notification sent to user ${userId} about premium purchase.`);
};
// Notify document sharing (Only premium users can share documents)
exports.notifyDocumentSharing = async (userId, shareWithUserId, documentId) => {
    // Check if both the sender and receiver are premium users and are not the same user
    if (await isUserPremium(userId) && await isUserPremium(shareWithUserId) && userId !== shareWithUserId) {
        const user = await User.findById(shareWithUserId);
        if (!user) {
            // Handle the case where the user to share with is not found
            return { success: false, message: "User to share with not found." };
        }
        const sender = await User.findById(userId);
        if (!sender) {
            // Handle the case where the sender is not found
            return { success: false, message: "Sender not found." };
        }

        const message = `A document has been shared with you by ${sender.username}.`;
        const type = 'document_shared';
        await createNotification(userId, null, message, type, documentId);
        return { success: true, message: "Document shared successfully." };
    } else {
        // If either user is not premium or if they are the same user, do not allow sharing
        return { success: false, message: "Both users must be premium and different to share documents." };
    }
};


// Notify linking a guest user (Only premium users can link guest users)
exports.notifyGuestUserLinking = async (premiumUserId, guestUserId) => {
    if (await isUserPremium(premiumUserId) && await isGuestUser(guestUserId)) {
        const guestUser = await DummyUser.findById(guestUserId);
        const message = `${guestUser.username} has been linked to your account.`;
        const type = 'guest_user_linked';
        await createNotification(premiumUserId, null, message, type);
    }
};

// Notify permission granted to a guest user
exports.notifyPermissionGranted = async (premiumUserId, guestUserId, permission) => {
    if (await isUserPremium(premiumUserId) && await isGuestUser(guestUserId)) {
        const guestUser = await DummyUser.findById(guestUserId);
        const message = `Permission ${permission} has been granted to ${guestUser.username}.`;
        const type = 'permission_granted';
        await createNotification(premiumUserId, null, message, type);
    }
};

// Additional notification functions can be implemented following similar checks and patterns.

module.exports = {
    notifyDocumentUpload,
    notifyDocumentDeletion,
    notifyDocumentDownload,
    notifyPremiumPurchase,
    notifyDocumentSharing,
    notifyGuestUserLinking,
    notifyPermissionGranted,
};
