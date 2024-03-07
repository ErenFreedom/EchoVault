const express = require('express');
const router = express.Router();
const sharedDocumentController = require('../controllers/SharedDocumentController');

// Middleware imports or definitions would go here, if you have any.

// POST route for sharing a document.
router.post('/share', sharedDocumentController.shareDocument);

// Export the router to be mounted in your main server file
module.exports = router;
