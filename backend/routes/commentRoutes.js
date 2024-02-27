const express = require('express');
const router = express.Router();
const { addComment, getComments, deleteComment } = require('../controllers/commentController');

// Add a comment to a post
router.post('/:postId/comments', addComment);

// Get all comments for a post
router.get('/:postId/comments', getComments);

// Delete a comment
router.delete('/comments/:commentId', deleteComment);

module.exports = router;
