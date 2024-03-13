const Document = require('../models/Document');
const User = require('../models/UserModel');
const SharedDocument = require('../models/SharedDocument');

// Middleware or utility function to check if a user is premium
const isUserPremium = async (userId) => {
    const user = await User.findById(userId);
    return user && user.isPremium;
};

exports.shareDocument = async (req, res) => {
    try {
        const { documentId, shareWithUserId } = req.body;
        const ownerId = req.user._id; // Assuming req.user is populated from JWT middleware

        // Prevent sharing with oneself
        if (ownerId.toString() === shareWithUserId.toString()) {
            return res.status(400).json({ message: 'You cannot share a document with yourself.' });
        }

        // Check if both owner and receiver are premium users
        if (!(await isUserPremium(ownerId)) || !(await isUserPremium(shareWithUserId))) {
            return res.status(403).json({ message: 'Both users must be premium to share documents.' });
        }

        // Check if the document exists and is owned by the requesting user
        const document = await Document.findOne({ _id: documentId, userId: ownerId });
        if (!document) {
            return res.status(404).json({ message: 'Document not found or you do not have permission to share it.' });
        }

        // Create a new shared document entry
        const sharedDocument = new SharedDocument({
            documentId,
            userId: ownerId,
            sharedWith: [shareWithUserId], // Ensure this matches your schema definition
            shareDate: new Date(),
            // Set any other fields you need, like expiration date or access fee if applicable
        });

        await sharedDocument.save();

        res.status(200).json({ message: 'Document shared successfully.', sharedDocument });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while sharing the document.', error: error.message });
    }
};


