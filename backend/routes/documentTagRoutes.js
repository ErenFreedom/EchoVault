const express = require('express');
const router = express.Router();
const documentTagController = require('../controllers/DocumentTagController');

// Middleware placeholders (for future implementation)
// const authMiddleware = require('../middleware/authMiddleware');

// Route to create a new tag
router.post('/tags', /* authMiddleware, */ documentTagController.createTag);

// Route to update an existing tag
router.patch('/tags/:tagId', /* authMiddleware, */ documentTagController.updateTag);

// Route to delete an existing tag
router.delete('/tags/:tagId', /* authMiddleware, */ documentTagController.deleteTag);

// Route to associate a tag with a document
router.post('/associate-tag', /* authMiddleware, */ documentTagController.associateTagWithDocument);

module.exports = router;
