const { checkPermissionForDummy, assignPermissionsToDummy } = require('../utils/permissions');

exports.assignPermissions = async (req, res) => {
    const { dummyUserId, lockerId, permissions } = req.body;

    try {
        await assignPermissionsToDummy(dummyUserId, lockerId, permissions);
        res.json({ message: 'Permissions assigned successfully.' });
    } catch (error) {
        console.error('Failed to assign permissions:', error);
        res.status(500).json({ message: 'Failed to assign permissions.', error: error.toString() });
    }
};

exports.checkPermissions = async (req, res) => {
    const { dummyUserId, lockerId, requiredPermission } = req.query;

    try {
        const hasPermission = await checkPermissionForDummy(dummyUserId, lockerId, requiredPermission);
        res.json({ hasPermission });
    } catch (error) {
        console.error('Failed to check permissions:', error);
        res.status(500).json({ message: 'Failed to check permissions.', error: error.toString() });
    }
};
