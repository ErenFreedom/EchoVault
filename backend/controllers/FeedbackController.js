const Feedback = require('../models/Feedback');
const User = require('../models/UserModel');
const DummyUser = require('../models/DummyUser');

// Function to submit feedback
const submitFeedback = async (req, res) => {
    const { content, rating } = req.body;  // Destructure content and rating from request body
    const userId = req.user._id;  // Get userId from authenticated user object

    try {
        // Check for recent feedback submission
        const lastFeedback = await Feedback.findOne({ userId }).sort({ createdAt: -1 });

        if (lastFeedback && new Date() - new Date(lastFeedback.createdAt) < 3600000) {
            // 3600000 milliseconds = 1 hour
            return res.status(429).json({ message: 'Please wait at least one hour before submitting new feedback.' });
        }

        if (!content || !rating) {
            return res.status(400).json({ message: 'Content and rating are required.' });
        }

        // Create new feedback if no recent submission found or if time interval has passed
        const newFeedback = new Feedback({
            userId,
            content,
            rating
        });

        await newFeedback.save();
        res.status(201).json({ message: 'Feedback submitted successfully', feedback: newFeedback });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ message: 'Failed to submit feedback', error: error.message });
    }
};

module.exports = {
    submitFeedback
};