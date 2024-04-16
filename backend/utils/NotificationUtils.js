// NotificationUtils.js
const Notification = require('../models/Notifications');
const User = require('../models/UserModel');

// Utility function to create a notification
async function createNotification(userId, message) {
  try {
    const notification = new Notification({
      userId,
      message,
    });
    await notification.save();
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

module.exports = { createNotification };
