const express = require('express');
const router = express.Router();
const {
  createTag,
  updateTag,
  deleteTag,
  associateTagWithDocument
} = require('../controllers/DocumentTagController');
const authMiddleware = require('../middleware/authMiddleware');
const { ensureIsPremiumUser } = require('../middleware/userTypeMiddleware');
const { validateTagCreation, validateTagAssociation } = require('../middleware/validationMiddleware');
const errorHandler = require('../middleware/errorMiddleware');

// Create a new tag - assuming only premium users can create tags
router.post('/tags', authMiddleware, ensureIsPremiumUser, validateTagCreation, createTag);

// Update a tag - assuming only premium users can update tags
router.patch('/tags/:tagId', authMiddleware, ensureIsPremiumUser, validateTagCreation, updateTag);

// Delete a tag - assuming only premium users can delete tags
router.delete('/tags/:tagId', authMiddleware, ensureIsPremiumUser, deleteTag);

// Associate a tag with a document - this might be allowed for all authenticated users
router.post('/tags/associate', authMiddleware, validateTagAssociation, associateTagWithDocument);

// Apply error handling middleware globally to all routes in this router
router.use(errorHandler);

module.exports = router;
