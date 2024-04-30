const Notification = require('../models/Notifications');
const User = require('../models/UserModel');

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
