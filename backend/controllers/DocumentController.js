const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const User = require('../models/UserModel');
const Document = require('../models/Document');
const bcrypt = require('bcryptjs');
const Locker = require('../models/Lockers'); // Ensure correct model name and path
const { checkPermissionForDummy } = require('../utils/permissions');



// async function encryptFile(filePath, encryptionKey) {
//   const iv = crypto.randomBytes(16); // Initialization vector
//   const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
//   const input = fs.createReadStream(filePath);
//   const encryptedFileName = `${path.basename(filePath, path.extname(filePath))}.enc`;
//   const encryptedFilePath = path.join(path.dirname(filePath), encryptedFileName);
//   const output = fs.createWriteStream(encryptedFilePath);

//   input.pipe(cipher).pipe(output);

//   return new Promise((resolve, reject) => {
//     output.on('finish', () => resolve({ encryptedFilePath, iv: iv.toString('hex') }));
//     output.on('error', reject);
//   });
// }
// async function decryptFile(encryptedFilePath, decryptionKey) {
//   const iv = fs.readFileSync(encryptedFilePath).slice(0, 16); // Assuming IV is stored at the start of the file
//   const encryptedContent = fs.readFileSync(encryptedFilePath).slice(16); // The rest is the encrypted content

//   const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(decryptionKey, 'hex'), iv);
//   let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
//   decrypted += decipher.final('utf8');

//   const decryptedFilePath = encryptedFilePath + '.dec'; // Temporary decrypted file path
//   fs.writeFileSync(decryptedFilePath, decrypted);
//   return decryptedFilePath;
// }

// exports.decryptAndDownloadDocument = async (req, res) => {
//   const { documentId } = req.params;
//   try {
//       const document = await Document.findById(documentId);
//       if (!document) {
//           return res.status(404).send('Document not found');
//       }

//       // Assume the encrypted file path is stored in document.filePath
//       const encryptedFilePath = path.join(__dirname, '..', 'uploads', document.filePath);
//       const decryptionKey = process.env.ENCRYPTION_KEY; // Ensure you have this in your environment variables

//       const decryptedFilePath = await decryptFile(encryptedFilePath, decryptionKey);

//       // Serve the decrypted file
//       res.download(decryptedFilePath, document.fileName, (err) => {
//           if (err) throw err;

//           // Optionally, delete the temporary decrypted file after sending it
//           fs.unlink(decryptedFilePath, (err) => {
//               if (err) console.error('Error deleting temporary file:', err);
//           });
//       });
//   } catch (error) {
//       console.error('Error decrypting document:', error);
//       res.status(500).json({ message: 'Failed to decrypt and download document.', error: error.message });
//   }
// };
exports.getDocumentsForLocker = async (req, res) => {
  const { lockerId } = req.params;
  try {
      const documents = await Document.find({ lockerId }).lean();
      res.json(documents);
  } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ message: 'Failed to fetch documents.', error: error.message });
  }
};

exports.uploadDocument = async (req, res) => {
  const { lockerId, title = "Untitled Document", documentType = "Unknown" } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'File must be provided.' });
  }

  try {
    const locker = await Locker.findById(lockerId);
    if (!locker) {
      return res.status(404).json({ message: 'Locker not found.' });
    }

    // Check if the document already exists in this locker
    const existingDocument = await Document.findOne({ lockerId, fileName: file.originalname });
    if (existingDocument) {
      // Optionally, you might want to delete the uploaded file from the server if it's a duplicate
      return res.status(409).json({ message: 'A document with the same name already exists in this locker.' });
    }

    // Create a new document entry in the database
    const newDocument = new Document({
      lockerId,
      documentType,
      title,
      fileName: file.originalname,
      filePath: `/uploads/${file.filename}`, // Assuming the file is saved in the 'uploads' directory
    });

    await newDocument.save();

    // Optionally, update the locker's document list if you're maintaining a reference to documents
    locker.documents.push(newDocument._id);
    await locker.save();

    res.status(201).json({ message: 'Document uploaded successfully.', document: newDocument });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: 'Failed to upload document.', error: error.message });
  }
};





exports.deleteDocument = async (req, res) => {
  const { documentId } = req.params;

  try {
    const documentToDelete = await Document.findById(documentId);
    if (!documentToDelete) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    // Construct the full path for the document
    const filePath = path.join(__dirname, '..', 'uploads', documentToDelete.fileName);

    // Attempt to delete the file from the filesystem
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        // Log the error if it's not about the file not existing
        console.error('Error deleting file from file system:', err);
      }
      // Even if the file doesn't exist, or there was an error deleting it,
      // proceed with removing the document reference from the database.
    });

    // Perform deletion of the document in the database
    await Document.findByIdAndDelete(documentId);

    // Optionally, update the locker to remove the document reference
    await Locker.updateOne(
      { _id: documentToDelete.lockerId },
      { $pull: { documents: documentId } }
    );

    res.status(200).json({ message: 'Document deleted successfully.' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Failed to delete document.', error: error.message });
  }
};




exports.downloadDocument = async (req, res) => {
  const { documentId } = req.params;
  const password = req.headers['x-document-password'];

  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  // Verify user password
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid password.' });
  }

  try {
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    // Adjust filePath to remove leading slash if present
    const filePath = path.resolve(__dirname, '..', document.filePath.startsWith('/') ? document.filePath.substring(1) : document.filePath);

    if (fs.existsSync(filePath)) {
      res.download(filePath, document.fileName);
    } else {
      return res.status(404).json({ message: 'File not found.' });
    }
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ message: 'Failed to download document.', error: error.message });
  }
};
