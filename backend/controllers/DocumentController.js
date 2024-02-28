const Document = require('../models/DocumentModel');

// Upload a document
exports.uploadDocument = async (req, res) => {
    const document = new Document({
        ...req.body,
        owner: req.user._id, // Assuming you have middleware to set req.user
    });

    try {
        await document.save();
        res.status(201).send(document);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Get documents for a user
exports.getDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ owner: req.user._id });
        res.send(documents);
    } catch (error) {
        res.status(500).send();
    }
};

// Other methods like updateDocument, deleteDocument, etc.
