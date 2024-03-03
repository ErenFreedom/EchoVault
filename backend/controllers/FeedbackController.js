const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');
const createError = require('http-errors');
const Joi = require('joi');

// Validation schema for feedback
const feedbackSchema = Joi.object({
  content: Joi.string().required().trim(),
  rating: Joi.number().required().min(1).max(5)
});

exports.submitFeedback = async (req, res, next) => {
  try {
    const { value, error } = feedbackSchema.validate(req.body);
    if (error) throw createError(400, error.details[0].message);

    const feedback = new Feedback({
      userId: req.user._id,
      content: value.content,
      rating: value.rating
    });

    await feedback.save();

    // Create a notification for the user about successful feedback submission
    const notification = new Notification({
      userId: req.user._id,
      message: 'Thank you for your feedback!',
      type: 'feedback_submitted',
    });

    await notification.save();

    res.status(201).json({ feedback, notification });
  } catch (error) {
    next(error);
  }
};

exports.promptForFeedback = async (req, res, next) => {
  try {
    // Calculate the date one month ago
    const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1));

    // Check if the user has submitted feedback in the last month
    const feedbackExists = await Feedback.findOne({
      userId: req.user._id,
      createdAt: { $gte: oneMonthAgo }
    });

    if (!feedbackExists) {
      // If not, send a prompt notification
      const promptNotification = new Notification({
        userId: req.user._id,
        message: 'How are we doing? Please give us your feedback.',
        type: 'feedback_prompt',
      });

      await promptNotification.save();

      res.json({ message: 'Feedback prompt sent', promptNotification });
    } else {
      res.json({ message: 'Feedback already provided. Thank you!' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports={
  submitFeedback,
  promptForFeedback
}

// Additional methods to handle feedback responses, etc...
