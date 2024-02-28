const SharedDocument = require('../models/SharedDocumentModel');

// Share a document
exports.shareDocument = async (req, res) => {
    const sharedDocument = new SharedDocument({
        ...req.body,
        owner: req.user._id,
    });

    try {
        await sharedDocument.save();
        res.status(201).send(sharedDocument);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Get shared documents
exports.getSharedDocuments = async (req, res) => {
    try {
        const sharedDocuments = await SharedDocument.find({ sharedWith: req.user._id });
        res.send(sharedDocuments);
    } catch (error) {
        res.status(500).send();
    }
};

// Other methods for managing shared document permissions, revoking access, etc.
