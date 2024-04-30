const mongoose = require('mongoose');
const DummyUser = require('../models/DummyUser');

/**
 * 
 * 
 * @param {string} dummyUserId 
 * @param {string} lockerId 
 * @param {string} requiredPermission 
 * @returns {Promise<boolean>} 
 */
async function checkPermissionForDummy(dummyUserId, lockerId, requiredPermission) {
    try {
        const dummyUser = await DummyUser.findById(dummyUserId).lean(); 
        if (!dummyUser) {
            console.log('Dummy user not found');
            return false; 
        }

        const lockerObjectId = mongoose.Types.ObjectId(lockerId);

        const permissionObject = dummyUser.permissions.find(p => p.lockerId.equals(lockerObjectId));
        return permissionObject && permissionObject.permissions.includes(requiredPermission);
    } catch (error) {
        console.error('Error checking permissions for dummy user:', error);
        throw error; 
    }
}

/**
 * 
 * 
 * @param {string} dummyUserId 
 * @param {string} lockerId 
 * @param {string[]} permissions 
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
            permissionObject.permissions = [...new Set([...permissionObject.permissions, ...newPermissions])];
        } else {
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
