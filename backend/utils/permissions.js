const mongoose = require('mongoose');
const DummyUser = require('../models/DummyUser'); // Make sure this path matches your file structure

/**
 * Check if a dummy user has specific permissions for a locker.
 * 
 * @param {string} dummyUserId - ID of the dummy user.
 * @param {string} lockerId - ID of the locker.
 * @param {string} requiredPermission - The permission to check for ('upload', 'delete', 'download').
 * @returns {Promise<boolean>} - Resolves with true if permission is granted, otherwise false.
 */
async function checkPermissionForDummy(dummyUserId, lockerId, requiredPermission) {
    try {
        const dummyUser = await DummyUser.findById(dummyUserId);
        if (!dummyUser) {
            console.log('Dummy user not found');
            return false; // Dummy user not found
        }

        // Convert lockerId to mongoose ObjectId for comparison
        const lockerObjectId = mongoose.Types.ObjectId(lockerId);

        // Check if the dummy user has the required permission for the specified locker
        const permissionObject = dummyUser.permissions.find(
            p => p.lockerId.equals(lockerObjectId)
        );

        if (!permissionObject || !permissionObject.permissions.includes(requiredPermission)) {
            console.log('Permission not found or not granted');
            return false; // No permissions found or not granted for this locker
        }

        return true; // Permission granted
    } catch (error) {
        console.error('Error checking permissions for dummy user:', error);
        throw error; // You may want to handle this error more gracefully in production
    }
}

/**
 * Assign permissions to a dummy user for a specific locker.
 * 
 * @param {string} dummyUserId - ID of the dummy user.
 * @param {string} lockerId - ID of the locker.
 * @param {string[]} permissions - Array of permissions to assign ('upload', 'delete', 'download').
 * @returns {Promise<void>}
 */
async function assignPermissionsToDummy(dummyUserId, lockerId, permissions) {
    try {
        const dummyUser = await DummyUser.findById(dummyUserId);
        if (!dummyUser) {
            throw new Error('Dummy user not found');
        }

        // Correctly convert lockerId to mongoose ObjectId using 'new'
        const lockerObjectId = new mongoose.Types.ObjectId(lockerId);

        // Update or add new permissions
        const existingPermissionsIndex = dummyUser.permissions.findIndex(
            p => p.lockerId.equals(lockerObjectId)
        );

        if (existingPermissionsIndex > -1) {
            // Update existing permissions
            dummyUser.permissions[existingPermissionsIndex].permissions = permissions;
        } else {
            // Assign new permissions
            dummyUser.permissions.push({ lockerId: lockerObjectId, permissions });
        }

        await dummyUser.save();
        console.log('Permissions successfully assigned to dummy user');
    } catch (error) {
        console.error('Error assigning permissions to dummy user:', error);
        throw error;
    }
}


module.exports = {
    checkPermissionForDummy,
    assignPermissionsToDummy
};
