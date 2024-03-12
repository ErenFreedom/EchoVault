const express = require('express');
const router = express.Router();
const { addIdentityProof, listIdentityProofs } = require('../controllers/IdentityProofController');
const { upload } = require('../middlewares/fileUploadMiddleware'); // Adjust the import path as necessary
const authMiddleware = require('../middleware/authMiddleware');
const { validateIdentityProofUpload } = require('../middleware/validationMiddleware'); // Assuming you have validation for identity proof data
const errorHandler = require('../middleware/errorMiddleware');
const permissionsMiddleware = require('../middleware/permissionsMiddleware');

// Route to add a new identity proof, with file upload, data validation, and permissions check
router.post('/add', authMiddleware, upload.array('documents'), validateIdentityProofUpload, permissionsMiddleware.checkIdentityProofUploadPermission, addIdentityProof);

// Route to list identity proofs for a user or dummy user, ensuring the request is authenticated
router.get('/list', authMiddleware, listIdentityProofs);

// Apply error handling middleware globally to all routes in this router
router.use(errorHandler);

module.exports = router;
