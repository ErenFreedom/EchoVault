const mongoose = require('mongoose');
const DummyUser = require('../models/DummyUser'); // Ensure the path matches your file structure

/**
 * Check if a dummy user has specific permissions for a locker.
 * 
 * @param {string} dummyUserId - ID of the dummy user.
 * @param {string} lockerId - ID of the locker.
 * @param {string} requiredPermission - The permission to check for ('open', 'upload', 'delete', 'download').
 * @returns {Promise<boolean>} - True if permission is granted, otherwise false.
 */
async function checkPermissionForDummy(dummyUserId, lockerId, requiredPermission) {
    try {
        const dummyUser = await DummyUser.findById(dummyUserId).lean(); // Using lean() for performance
        if (!dummyUser) {
            console.log('Dummy user not found');
            return false; // Dummy user not found
        }

        // Convert lockerId to mongoose ObjectId for comparison
        const lockerObjectId = mongoose.Types.ObjectId(lockerId);

        // Check if the dummy user has the required permission for the specified locker
        const permissionObject = dummyUser.permissions.find(p => p.lockerId.equals(lockerObjectId));
        return permissionObject && permissionObject.permissions.includes(requiredPermission);
    } catch (error) {
        console.error('Error checking permissions for dummy user:', error);
        throw error; // Consider graceful error handling
    }
}

/**
 * Assign permissions to a dummy user for a specific locker.
 * 
 * @param {string} dummyUserId - ID of the dummy user.
 * @param {string} lockerId - ID of the locker.
 * @param {string[]} permissions - Permissions to assign ('open', 'upload', 'delete', 'download').
 * @returns {Promise<void>}
 */
async function assignPermissionsToDummy(dummyUserId, lockerId, newPermissions) {
    try {
        const dummyUser = await DummyUser.findById(dummyUserId);
        if (!dummyUser) {
            throw new Error('Dummy user not found');
        }

        const lockerObjectId = mongoose.Types.ObjectId(lockerId);
        let permissionObject = dummyUser.permissions.find(p => p.lockerId.equals(lockerObjectId));

        if (permissionObject) {
            // Merge new permissions with existing ones and remove duplicates
            permissionObject.permissions = [...new Set([...permissionObject.permissions, ...newPermissions])];
        } else {
            // Assign new permissions for a new locker
            dummyUser.permissions.push({ lockerId: lockerObjectId, permissions: newPermissions });
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
