const express = require('express');
const router = express.Router();

const {
  createTag,
  updateTag,
  deleteTag,
  associateTagWithDocument
} = require('../controllers/DocumentTagController');

// Middleware to protect routes if needed
// const { protectRoute } = require('../middleware/authMiddleware');

// Create a new tag
router.post('/tags', createTag);

// Update a tag
router.patch('/tags/:tagId', updateTag);

// Delete a tag
router.delete('/tags/:tagId', deleteTag);

// Associate a tag with a document
router.post('/tags/associate', associateTagWithDocument);

// Other routes can be added here

module.exports = router;
