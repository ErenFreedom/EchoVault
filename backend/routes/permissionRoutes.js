const express = require('express');
const permissionsController = require('../controllers/permissionsController'); 
const authMiddleware = require('../middleware/authMiddleware'); 
const router = express.Router();

router.post('/assign-permissions', authMiddleware, permissionsController.assignPermissions);

router.get('/check-permissions', authMiddleware, permissionsController.checkPermissions);

module.exports = router;
