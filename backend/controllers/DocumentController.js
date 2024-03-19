const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const Locker = require('../models/Lockers'); // Ensure correct model name and path
const { checkPermissionForDummy } = require('../utils/permissions');




async function encryptFile(filePath, encryptionKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
  const input = fs.createReadStream(filePath);
  const encryptedFileName = path.basename(filePath) + '.enc';
  const encryptedFilePath = path.join(path.dirname(filePath), encryptedFileName);
  const output = fs.createWriteStream(encryptedFilePath);

  return new Promise((resolve, reject) => {
    input.pipe(cipher).pipe(output).on('finish', () => {
      resolve(encryptedFilePath); // Returns the path of the encrypted file
    }).on('error', reject);
  });
}

exports.uploadDocument = async (req, res) => {
  const { lockerId, title, documentType } = req.body;
  const file = req.file;
  const userId = req.user._id.toString(); // Convert to string for comparison
  const encryptionKey = process.env.ENCRYPTION_KEY;

  try {
    const locker = await Locker.findById(lockerId);
    if (!locker) {
      return res.status(404).json({ message: 'Locker not found.' });
    }

    // Check ownership and permission after fetching the locker
    const isOwner = locker.userId.toString() === userId; // Ensure both IDs are strings for comparison
    // Assume checkPermissionForDummy() returns a boolean indicating if the user has upload permission
    const hasPermission = isOwner || await checkPermissionForDummy(userId, lockerId, 'upload');

    console.log("Locker userId:", locker.userId.toString());
    console.log("Requesting userId:", userId);
    console.log("Is owner:", isOwner);
    console.log("Has permission:", hasPermission);

    if (!hasPermission) {
      return res.status(403).json({ message: 'You do not have permission to upload documents to this locker.' });
    }

    if (!file) {
      return res.status(400).send({ message: 'No file uploaded.' });
    }

    // Additional logic for handling file upload...

    const encryptedFilePath = await encryptFile(file.path, encryptionKey); // Ensure this function is implemented
    const newDocument = new Document({
      userId: locker.userId, // Use the locker's userId to associate the document
      lockerId,
      documentType,
      title,
      fileName: file.originalname,
      filePath: encryptedFilePath,
    });

    await newDocument.save();

    // Optionally, update the locker document list if you're maintaining a list of document IDs in the locker
    locker.documents.push(newDocument._id);
    await locker.save();

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

    const locker = await Locker.findById(document.lockerId).populate('userId');
    if (!locker) {
      return res.status(404).json({ message: 'Locker not found.' });
    }

    // Adjusting to support checking against an array of userIds for shared lockers
    const isOwner = locker.userId.map(user => user._id.toString()).includes(userId.toString());
    // Assuming checkPermissionForDummy() correctly handles checking for specific permissions
    const hasPermission = isOwner || await checkPermissionForDummy(userId, document.lockerId, 'delete');

    if (!hasPermission) {
      return res.status(403).json({ message: 'You do not have permission to delete this document.' });
    }

    // Remove the document
    await Document.findByIdAndDelete(documentId);

    // Update the locker to remove the document reference
    await Locker.updateOne(
      { _id: locker._id },
      { $pull: { documents: document._id } }
    );

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
    // Ensure document and related locker information are properly loaded
    const document = await Document.findById(documentId).populate({
      path: 'lockerId',
      select: 'userId dummyUserIds', // Only load necessary fields to check permissions
    });

    if (!document || !document.lockerId) {
      return res.status(404).json({ message: 'Document or associated locker not found.' });
    }

    const locker = document.lockerId;

    // Check if the current user is the owner of the locker
    const isOwner = locker.userId.toString() === userId.toString();

    // Check if the current user is a dummy user with access to the locker
    const hasAccessAsDummy = locker.dummyUserIds.some(dummyId => dummyId.toString() === userId.toString());

    if (!isOwner && !hasAccessAsDummy) {
      return res.status(403).json({ message: 'You do not have permission to download this document.' });
    }

    // Assuming document.filePath is the path to the document relative to the server root
    const filePath = path.resolve(__dirname, '..', 'uploads', document.filePath);

    // Verify the file exists before attempting to send it
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found.' });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ message: 'Failed to download document.', error: error.message });
  }
};
