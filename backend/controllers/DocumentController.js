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
  const userId = req.user._id;
  const encryptionKey = process.env.ENCRYPTION_KEY;

  try {
    const locker = await Locker.findById(lockerId);
    if (!locker) {
      return res.status(404).json({ message: 'Locker not found.' });
    }

    const isOwner = locker.userId.equals(userId);
    const hasPermission = isOwner || await checkPermissionForDummy(userId, lockerId, 'upload');
    if (!hasPermission) {
      return res.status(403).json({ message: 'You do not have permission to upload documents to this locker.' });
    }

    if (!file) {
      return res.status(400).send({ message: 'No file uploaded.' });
    }

    // Check if the document already exists in the locker
    const existingDocument = await Document.findOne({ lockerId, fileName: file.originalname });
    if (existingDocument) {
      // Optionally, you could also compare file hashes or content if you want to be thorough
      return res.status(409).json({ message: 'A document with the same name already exists in this locker.' });
    }

    // Encrypt the file and create a new document as before
    const encryptedFilePath = await encryptFile(file.path, encryptionKey);
    const newDocument = new Document({
      userId,
      lockerId,
      documentType,
      title,
      fileName: file.originalname,
      filePath: encryptedFilePath,
    });

    await newDocument.save();

    // Add the new document to the locker and save
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

      const locker = await Locker.findById(document.lockerId);
      if (!locker) {
          return res.status(404).json({ message: 'Locker not found.' });
      }

      const isOwner = locker.userId.equals(userId);
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
      const document = await Document.findById(documentId).populate('lockerId');
      if (!document) {
          return res.status(404).json({ message: 'Document not found.' });
      }

      const locker = await Locker.findById(document.lockerId);
      const isOwner = locker.userId.equals(userId);
      const canAccess = isOwner || locker.dummyUserIds.some(dummyId => dummyId.equals(userId));

      if (!canAccess) {
          return res.status(403).json({ message: 'You do not have permission to download this document.' });
      }

      // Construct the absolute file path
      const filePath = path.join(__dirname, '..', 'uploads', path.basename(document.filePath));
      res.sendFile(filePath);
  } catch (error) {
      console.error('Error downloading document: ', error);
      res.status(500).json({ message: 'Failed to download document.', error: error.message });
  }
};
