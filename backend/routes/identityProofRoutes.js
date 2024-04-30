const express = require('express');
const multer = require('multer');
const router = express.Router();
const identityProofController = require('../controllers/IdentityProofController');

const upload = multer({ dest: 'uploads/' });


router.post('/add', /* authMiddleware, */ upload.array('documents'), identityProofController.addIdentityProof);

router.get('/list', /* authMiddleware, */ identityProofController.listIdentityProofs);

module.exports = router;
