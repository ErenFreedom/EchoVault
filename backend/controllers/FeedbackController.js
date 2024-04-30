const Feedback = require('../models/Feedback');
const User = require('../models/UserModel');
const DummyUser = require('../models/DummyUser');


const submitFeedback = async (req, res) => {
    const { content, rating } = req.body;  
    const userId = req.user._id;  

    try {
        
        const lastFeedback = await Feedback.findOne({ userId }).sort({ createdAt: -1 });

        if (lastFeedback && new Date() - new Date(lastFeedback.createdAt) < 3600000) {
            
            return res.status(429).json({ message: 'Please wait at least one hour before submitting new feedback.' });
        }

        if (!content || !rating) {
            return res.status(400).json({ message: 'Content and rating are required.' });
        }

        
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