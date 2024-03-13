const express = require('express');
const multer = require('multer');
const router = express.Router();
const identityProofController = require('../controllers/IdentityProofController');

// Configure multer or your file upload middleware
const upload = multer({ dest: 'uploads/' });

// Middleware placeholders (for future implementation)
// const authMiddleware = require('../middleware/authMiddleware');

// Route to add an identity proof, including file uploads
router.post('/add', /* authMiddleware, */ upload.array('documents'), identityProofController.addIdentityProof);

// Route to list identity proofs for a user or dummy user
router.get('/list', /* authMiddleware, */ identityProofController.listIdentityProofs);

module.exports = router;
