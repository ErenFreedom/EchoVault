// DummyUser model should be required if you're checking against a database
const DummyUser = require('../models/DummyUser'); // Adjust the path as needed

/**
 * Check if a dummy user has specific permissions for a locker.
 * @param {string} dummyUserId - ID of the dummy user.
 * @param {string} lockerId - ID of the locker.
 * @param {string} requiredPermission - The permission to check for ('upload', 'delete', 'download').
 * @returns {Promise<boolean>} - Resolves with true if permission is granted, otherwise false.
 */
async function checkPermissionForDummy(dummyUserId, lockerId, requiredPermission) {
    try {
        const dummyUser = await DummyUser.findById(dummyUserId);
        if (!dummyUser) {
            return false; // Dummy user not found
        }

        // Check if the dummy user has the required permission for the specified locker
        const permissionObject = dummyUser.permissions.find(
            p => p.lockerId.toString() === lockerId.toString()
        );

        if (!permissionObject) {
            return false; // No permissions set for this locker
        }

        return permissionObject.permissions.includes(requiredPermission);
    } catch (error) {
        console.error('Error checking permissions for dummy user:', error);
        throw error; // You may want to handle this error more gracefully in production
    }
}

/**
 * Assign permissions to a dummy user for a specific locker.
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

        // Update or add new permissions
        const existingPermissionsIndex = dummyUser.permissions.findIndex(
            p => p.lockerId.toString() === lockerId.toString()
        );

        if (existingPermissionsIndex > -1) {
            // Update existing permissions
            dummyUser.permissions[existingPermissionsIndex].permissions = permissions;
        } else {
            // Assign new permissions
            dummyUser.permissions.push({ lockerId, permissions });
        }

        await dummyUser.save();
    } catch (error) {
        console.error('Error assigning permissions to dummy user:', error);
        throw error;
    }
}

module.exports = {
    checkPermissionForDummy,
    assignPermissionsToDummy
};
