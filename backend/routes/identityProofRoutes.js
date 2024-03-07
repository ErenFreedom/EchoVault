const express = require('express');
const router = express.Router();
const { addIdentityProof, listIdentityProofs } = require('../controllers/IdentityProofController');
const upload = require('../middlewares/uploadMiddleware'); // Assuming you have a middleware for handling file uploads

// Route to add a new identity proof
// Assumes `uploadMiddleware` is a middleware function to handle file uploads
router.post('/add', upload.array('documents'), addIdentityProof);

// Route to list identity proofs for a user or dummy user
router.get('/list', listIdentityProofs);

module.exports = router;
