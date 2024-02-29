// commentController.js

// Import necessary models or any other libraries
const Comment = require('../models/CommentModel'); // Make sure you have a CommentModel

// Function to add a comment
exports.addComment = async (req, res) => {
    try {
        // Create a new comment with request data
        const newComment = new Comment(req.body);
        // Save the comment to the database
        await newComment.save();
        // Send back a response
        res.status(201).json(newComment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Function to get comments
exports.getComments = async (req, res) => {
    try {
        // Retrieve comments from the database
        const comments = await Comment.find({});
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Function to delete a comment
exports.deleteComment = async (req, res) => {
    try {
        // Delete a comment based on the provided ID
        const deletedComment = await Comment.findByIdAndDelete(req.params.id);
        if (!deletedComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
