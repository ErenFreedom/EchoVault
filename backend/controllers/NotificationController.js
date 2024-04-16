const { createNotification } = require('../utils/NotificationUtils');

exports.notifyDocumentUpload = async (req, res) => {
    const userId = req.user._id; // Get the user ID from the authenticated user
    const { documentTitle } = req.body; // Assuming the document title is sent in the request body
    const message = `A new document "${documentTitle}" has been uploaded.`;
    
    try {
      await createNotification(userId, message, 'document_uploaded');
      res.status(200).json({ message: "Notification for document upload sent successfully." });
    } catch (error) {
      console.error('Error sending upload notification:', error);
      res.status(500).json({ message: "Failed to send notification.", error: error.message });
    }
  };

  exports.notifyDocumentDeletion = async (req, res) => {
    const userId = req.user._id;
    const { documentTitle } = req.body;
    const message = `The document "${documentTitle}" has been deleted.`;
  
    try {
      await createNotification(userId, message, 'document_deleted');
      res.status(200).json({ message: "Notification for document deletion sent successfully." });
    } catch (error) {
      console.error('Error sending deletion notification:', error);
      res.status(500).json({ message: "Failed to send notification.", error: error.message });
    }
  };

  exports.notifyDocumentDownload = async (req, res) => {
    const userId = req.user._id; // Get the user ID from the authenticated user
    const { documentTitle } = req.body; // Assuming you're sending the document title in the request body
    const message = `The document "${documentTitle}" has been downloaded.`;
  
    try {
      await createNotification(userId, message, 'document_downloaded');
      res.status(200).json({ message: "Notification for document download sent successfully." });
    } catch (error) {
      console.error('Error sending download notification:', error);
      res.status(500).json({ message: "Failed to send notification.", error: error.message });
    }
  };
  
  exports.notifyProfileUpdate = async (req, res) => {
    const userId = req.user._id;
    const message = `Your profile has been successfully updated.`;
  
    try {
      await createNotification(userId, message, 'profile_updated');
      res.status(200).json({ message: "Notification for profile update sent successfully." });
    } catch (error) {
      console.error('Error sending profile update notification:', error);
      res.status(500).json({ message: "Failed to send notification.", error: error.message });
    }
  };
  
  exports.notifyLockerCreated = async (req, res) => {
    const userId = req.user._id;
    const message = `An additional locker has been successfully created.`;
  
    try {
      await createNotification(userId, message, 'locker_created');
      res.status(200).json({ message: "Notification for locker creation sent successfully." });
    } catch (error) {
      console.error('Error sending locker creation notification:', error);
      res.status(500).json({ message: "Failed to send notification.", error: error.message });
    }
  };
  
  exports.notifyPasswordChange = async (req, res) => {
    const userId = req.user._id;
    const message = `Your password has been successfully changed.`;
  
    try {
      await createNotification(userId, message, 'password_changed');
      res.status(200).json({ message: "Notification for password change sent successfully." });
    } catch (error) {
      console.error('Error sending password change notification:', error);
      res.status(500).json({ message: "Failed to send notification.", error: error.message });
    }
  };
// exports.markNotificationsAsRead = async (req, res) => {
//     try {
//       // You may want to filter which notifications to mark as read, e.g., by userId
//       const userId = req.user._id; // Assuming you have the user's ID from auth middleware
//       await Notification.updateMany(
//         { userId, isRead: false },
//         { $set: { isRead: true } }
//       );
  
//       res.status(200).json({ message: "Notifications marked as read." });
//     } catch (error) {
//       console.error('Error marking notifications as read:', error);
//       res.status(500).json({ message: "An error occurred while updating notifications.", error: error.message });
//     }
//   };
  
exports.markNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming you have user info on the request object from auth middleware

        // Update all notifications setting isRead to true
        await Notification.updateMany(
            { userId, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({ message: "Notifications marked as read." });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({ message: "An error occurred while updating notifications.", error: error.message });
    }
};

