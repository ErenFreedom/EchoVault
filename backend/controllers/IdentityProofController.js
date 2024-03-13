const IdentityProofs = require('../models/IdentityProofs');
const User = require('../models/UserModel');
const DummyUser = require('../models/DummyUser');

exports.addIdentityProof = async (req, res) => {
    const { userId, dummyUserId, proofType, proofNumber } = req.body;
    const documentIds = req.files.map(file => file.id); // Assuming file upload middleware adds uploaded file IDs to `req.files`

    try {
        // Validate user or dummy user existence
        let owner;
        if (userId) {
            owner = await User.findById(userId);
        } else if (dummyUserId) {
            owner = await DummyUser.findById(dummyUserId);
        }
        if (!owner) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const newIdentityProof = new IdentityProofs({
            userId: userId || null, // Ensure only one is set
            dummyUserId: dummyUserId || null,
            proofType,
            proofNumber,
            documentIds
        });

        await newIdentityProof.save();
        res.status(201).json({ message: 'Identity proof added successfully.', newIdentityProof });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add identity proof.', error: error.toString() });
    }
};

exports.listIdentityProofs = async (req, res) => {
    const { userId, dummyUserId } = req.query;

    try {
        let identityProofs;
        if (userId) {
            identityProofs = await IdentityProofs.find({ userId });
        } else if (dummyUserId) {
            identityProofs = await IdentityProofs.find({ dummyUserId });
        } else {
            return res.status(400).json({ message: 'User identification is required.' });
        }

        res.status(200).json({ identityProofs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve identity proofs.', error: error.toString() });
    }
};

// Export additional controller methods as needed

