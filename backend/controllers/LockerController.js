const Locker = require('../models/LockerModel');

// Create a new locker
exports.createLocker = async (req, res) => {
    const locker = new Locker({
        ...req.body,
        owner: req.user._id,
    });

    try {
        await locker.save();
        res.status(201).send(locker);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Get lockers for a user
exports.getLockers = async (req, res) => {
    try {
        const lockers = await Locker.find({ owner: req.user._id });
        res.send(lockers);
    } catch (error) {
        res.status(500).send();
    }
};

// Other methods like updateLocker, deleteLocker, etc.
