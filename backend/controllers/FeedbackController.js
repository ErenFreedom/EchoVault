const Feedback = require('../models/Feedback');
const User = require('../models/UserModel');
const DummyUser = require('../models/DummyUser');

// Function to submit feedback
exports.submitFeedback = async (req, res) => {
    const { content, rating, userId, dummyUserId } = req.body;

    try {
        let username = null;

        // Validate the user or dummy user existence and retrieve username
        if (userId) {
            const user = await User.findById(userId);
            if (!user) return res.status(404).send({ message: 'User not found.' });
            username = user.username; // Assuming the username field exists in your user model
        } else if (dummyUserId) {
            const dummyUser = await DummyUser.findById(dummyUserId);
            if (!dummyUser) return res.status(404).send({ message: 'Dummy user not found.' });
            username = dummyUser.username; // Assuming the username field exists in your dummy user model
        } else {
            return res.status(400).send({ message: 'User identification is required.' });
        }

        const newFeedback = new Feedback({
            userId,
            dummyUserId,
            content,
            rating
            // Optionally, you can add username here if your feedback model supports it
        });

        await newFeedback.save();

        // Include the username in the success response
        res.status(201).json({
            message: "Feedback submitted successfully.",
            username: username // This line includes the username in the response
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error submitting feedback", error: error.toString() });
    }
};


