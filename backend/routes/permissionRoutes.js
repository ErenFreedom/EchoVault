const express = require('express');
const permissionsController = require('../controllers/permissionsController'); // Adjust the path as needed
const authMiddleware = require('../middleware/authMiddleware'); // Ensure this path is correct
const router = express.Router();

// Route for assigning permissions to a dummy user
router.post('/assign-permissions', authMiddleware, permissionsController.assignPermissions);

// Route for checking a dummy user's permissions
router.get('/check-permissions', authMiddleware, permissionsController.checkPermissions);

module.exports = router;
