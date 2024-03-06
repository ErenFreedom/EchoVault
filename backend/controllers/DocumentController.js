const Document = require('../models/Document');
const Locker = require('../models/Locker');
const { checkPermissionForDummy } = require('../utils/permissions'); // Utility to check permissions

exports.uploadDocument = async (req, res) => {
  const { lockerId, documentData } = req.body; // Assume documentData contains all necessary document fields
  const userId = req.user._id; // Extracted from JWT or session

  try {
    const locker = await Locker.findById(lockerId);
    if (!locker) {
      return res.status(404).json({ message: 'Locker not found.' });
    }

    // Check if the user is the locker owner or has upload permission
    const isOwner = locker.userId.equals(userId);
    const hasPermission = isOwner || await checkPermissionForDummy(userId, lockerId, 'upload');

    if (!hasPermission) {
      return res.status(403).json({ message: 'You do not have permission to upload documents to this locker.' });
    }

    const newDocument = new Document({ ...documentData, userId, lockerId });
    await newDocument.save();

    res.status(201).json({ message: 'Document uploaded successfully.', document: newDocument });
  } catch (error) {
    console.error('Error uploading document: ', error);
    res.status(500).json({ message: 'Failed to upload document.', error: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
    const { documentId } = req.params;
    const userId = req.user._id;
  
    try {
      const document = await Document.findById(documentId);
      if (!document) {
        return res.status(404).json({ message: 'Document not found.' });
      }
  
      const locker = await Locker.findById(document.lockerId);
      const isOwner = locker.userId.equals(userId);
      const hasPermission = isOwner || await checkPermissionForDummy(userId, document.lockerId, 'delete');
  
      if (!hasPermission) {
        return res.status(403).json({ message: 'You do not have permission to delete this document.' });
      }
  
      await document.remove();
      res.status(200).json({ message: 'Document deleted successfully.' });
    } catch (error) {
      console.error('Error deleting document: ', error);
      res.status(500).json({ message: 'Failed to delete document.', error: error.message });
    }
  };

  exports.downloadDocument = async (req, res) => {
    const { documentId } = req.params;
    const userId = req.user._id;
  
    try {
      const document = await Document.findById(documentId).populate('lockerId');
      if (!document) {
        return res.status(404).json({ message: 'Document not found.' });
      }
  
      // Assuming all users with access to the locker can download documents
      const locker = await Locker.findById(document.lockerId);
      const isOwner = locker.userId.equals(userId);
      const canAccess = isOwner || locker.dummyUserIds.some(dummyId => dummyId.equals(userId));
  
      if (!canAccess) {
        return res.status(403).json({ message: 'You do not have permission to download this document.' });
      }
  
      // Implement the actual download logic here
      // For example, res.sendFile(filePath) or similar based on your storage solution
    } catch (error) {
      console.error('Error downloading document: ', error);
      res.status(500).json({ message: 'Failed to download document.', error: error.message });
    }
  };
  

module.exports={
  uploadDocument,
  deleteDocument,
  downloadDocument
}