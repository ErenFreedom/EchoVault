const Document = require('../models/Document');
const User = require('../models/UserModel');
const SharedDocument = require('../models/SharedDocuments');

const isUserPremium = async (userId) => {
    const user = await User.findById(userId);
    return user && user.isPremium;
};

exports.shareDocument = async (req, res) => {
    try {
        const { documentId, shareWithUserId } = req.body;
        const ownerId = req.user._id; 

        
        if (ownerId.toString() === shareWithUserId.toString()) {
            return res.status(400).json({ message: 'You cannot share a document with yourself.' });
        }

        
        if (!(await isUserPremium(ownerId)) || !(await isUserPremium(shareWithUserId))) {
            return res.status(403).json({ message: 'Both users must be premium to share documents.' });
        }

        
        const document = await Document.findOne({ _id: documentId, userId: ownerId });
        if (!document) {
            return res.status(404).json({ message: 'Document not found or you do not have permission to share it.' });
        }

        
        const sharedDocument = new SharedDocument({
            documentId,
            userId: ownerId,
            sharedWith: [shareWithUserId], 
            shareDate: new Date(),
            
        });

        await sharedDocument.save();

        res.status(200).json({ message: 'Document shared successfully.', sharedDocument });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while sharing the document.', error: error.message });
    }
};


