const Locker = require('../models/Lockers'); 

const addLocker = async (req, res) => {
    if (!req.user.isPremium) {
        return res.status(403).json({ message: 'Only premium users can create new lockers.' });
    }

    const { lockerName } = req.body;

    // Check if a locker with the same name already exists for this user
    const lockerExists = await Locker.findOne({ lockerName: lockerName, userId: req.user._id });
    if (lockerExists) {
        return res.status(409).json({ message: 'A locker with this name already exists.' });
    }

    try {
        
        const newLocker = new Locker({
            lockerName,
            lockerType: 'Custom', 
            userId: req.user._id, 
        });

        const savedLocker = await newLocker.save();
        res.status(201).json(savedLocker);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    addLocker,
};
