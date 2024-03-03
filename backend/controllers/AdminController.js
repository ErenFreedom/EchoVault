const User = require('./User');
const Document = require('./Document'); // Assuming you have a Document model
const Locker = require('./Locker');
const LinkedAccount = require('./LinkedAccount');

const UserController = {
    // Update user profile information
    updateProfile: async (req, res) => {
        const { userId } = req.params;
        const updates = req.body; // Expecting fields that can be updated

        try {
            const user = await User.findByIdAndUpdate(userId, updates, { new: true });
            if (!user) {
                return res.status(404).send({ message: 'User not found.' });
            }
            res.status(200).send({ message: 'Profile updated successfully.', user });
        } catch (error) {
            res.status(500).send({ message: 'Error updating profile.', error: error.message });
        }
    },

    // Upload a document
    uploadDocument: async (req, res) => {
        const { userId } = req.params;
        const { title, content, lockerId } = req.body; // Simplified for example

        try {
            const newDocument = new Document({
                userId,
                title,
                content,
                lockerId, // Assuming a reference to which locker the document belongs
            });
            await newDocument.save();

            res.status(201).send({ message: 'Document uploaded successfully.', document: newDocument });
        } catch (error) {
            res.status(500).send({ message: 'Error uploading document.', error: error.message });
        }
    },

    // Delete a document
    deleteDocument: async (req, res) => {
        const { documentId } = req.params;

        try {
            const document = await Document.findByIdAndDelete(documentId);
            if (!document) {
                return res.status(404).send({ message: 'Document not found.' });
            }
            res.status(200).send({ message: 'Document deleted successfully.' });
        } catch (error) {
            res.status(500).send({ message: 'Error deleting document.', error: error.message });
        }
    },

    // Sign out from the account (Simplified example)
    signOut: (req, res) => {
        // For session-based authentication
        if (req.session) {
            req.session.destroy(err => {
                if (err) {
                    // Handle error scenario
                    return res.status(500).json({ message: "Error occurred during sign out." });
                }
                // Optionally clear the session cookie
                res.clearCookie('connect.sid'); // Make sure 'connect.sid' matches the name of your session ID cookie
                return res.status(200).json({ message: "You've been signed out successfully." });
            });
        } 
        // For JWT-based authentication
        else {
            // Instructing the client to clear the JWT token as the server cannot directly remove client-side tokens
            // Note: This relies on client-side implementation to remove the token from storage (e.g., localStorage in web applications)
            return res.status(200).json({ message: "Please clear your JWT token. You've been signed out." });
        }
    },
    createCustomLocker: async (req, res) => {
        const { userId, lockerName } = req.body;
        const user = await User.findById(userId);

        if (!user || !user.isPremium) {
            return res.status(403).send({ message: "Only premium users can create custom lockers." });
        }

        // Check for existing locker with the same name for this user
        const existingLocker = await Locker.findOne({ userId, lockerName });
        if (existingLocker) {
            return res.status(400).send({ message: "A locker with this name already exists." });
        }

        const newLocker = new Locker({ userId, lockerName });
        await newLocker.save();
        res.status(201).send({ message: "Custom locker created successfully.", locker: newLocker });
    },

    // Share a document with another premium user
    shareDocumentWithPremiumUser: async (req, res) => {
        const { documentId, ownerId, recipientId } = req.body;
        const owner = await User.findById(ownerId);
        const recipient = await User.findById(recipientId);

        if (!owner || !owner.isPremium) {
            return res.status(403).send({ message: "Only premium users can share documents." });
        }

        if (!recipient || !recipient.isPremium) {
            return res.status(403).send({ message: "Documents can only be shared with other premium users." });
        }

        // Implement your document sharing logic here
        await Document.findByIdAndUpdate(documentId, { $addToSet: { sharedWith: recipientId } });

        res.status(200).send({ message: "Document shared successfully with premium user." });
    },

    // Add a linked account to an admin user
    addLinkedAccount: async (req, res) => {
        // Assuming this feature is for premium users to manage their linked accounts
        const { adminUserId, linkedUserId, permissions } = req.body; // permissions example: ['upload', 'delete']
        const adminUser = await User.findById(adminUserId);

        if (!adminUser || !adminUser.isPremium) {
            return res.status(403).send({ message: "Only premium users can add linked accounts." });
        }

        const updatedLinkedAccount = await LinkedAccount.findOneAndUpdate(
            { UserId: adminUserId },
            { $push: { linkedUsers: { accountId: linkedUserId, permissions } } },
            { new: true, upsert: true }
        );
        res.status(200).send({ message: 'Linked account added successfully.', linkedAccount: updatedLinkedAccount });
    },

    // Delete a linked account from an admin user
    deleteLinkedAccount: async (req, res) => {
        const { adminUserId, linkedUserId } = req.body;
        const adminUser = await User.findById(adminUserId);

        if (!adminUser || !adminUser.isPremium) {
            return res.status(403).send({ message: "Only premium users can delete linked accounts." });
        }

        const updatedLinkedAccount = await LinkedAccount.findOneAndUpdate(
            { UserId: adminUserId },
            { $pull: { linkedUsers: { accountId: linkedUserId } } },
            { new: true }
        );
        if (!updatedLinkedAccount) {
            return res.status(404).send({ message: 'Linked account not found.' });
        }
        res.status(200).send({ message: 'Linked account removed successfully.', linkedAccount: updatedLinkedAccount });
    },

    

    // Additional functionalities as needed...
};

module.exports = AdminController;
