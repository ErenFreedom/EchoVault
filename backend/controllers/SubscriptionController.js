const mongoose = require('mongoose');
const Subscription = require('../models/Subscription'); 

mongoose.connect('mongodb://localhost:27017/LockerDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const createBasicLockerPlan = async () => {
    try {
        const basicLockerExists = await Subscription.findOne({ planName: "BasicLocker" });

        if (basicLockerExists) {
            console.log("BasicLocker plan already exists.");
            return;
        }

        const basicLockerPlan = new Subscription({
            planName: "BasicLocker",
            price: 0, // Free plan
            duration: Infinity, 
            features: [
                "10 documents per Locker",
                "Max file size 25MB",
                "Formats: jpg, jpeg, pdf, img"
            ],
            isActive: true,
            storageLimit: 10, 
            fileSizeLimit: 25, 
            lockerLimit: 9, 
            premiumFeatures: [],
            accountLinkingLimit: 0, 
        });

        await basicLockerPlan.save();
        console.log("BasicLocker plan created successfully.");
    } catch (error) {
        console.error("Error creating BasicLocker plan:", error);
    }
};

createBasicLockerPlan();


const createPremiumLockerPlan = async () => {
    const premiumLockerExists = await Subscription.findOne({ planName: "PremiumLocker" });
    if (!premiumLockerExists) {
        const premiumLocker = new Subscription({
            planName: "PremiumLocker",
            price: 15, 
            duration: 1, 
            features: ['Unlimited custom lockers', 'Link up to 3 accounts', 'Upload up to 100MB per file', '50 documents per locker'],
            isActive: true,
            storageLimit: 100, 
            lockerLimit: 50,
            premiumFeatures: ['CustomLockerCreation', 'AccountLinking', 'IncreasedStorageAndDocumentLimits'],
            accountLinkingLimit: 3
        });
        await premiumLocker.save();
        console.log("PremiumLocker plan created successfully.");
    }
};


createPremiumLockerPlan();


exports.upgradeToPremium = async (req, res) => {
    const { userId } = req.user; 
    const { paymentDetails } = req.body; 

    try {
        const user = await User.findById(userId);
        const currentSubscription = await UserSubscription.findOne({ userId: user._id, isActive: true });

       
        if (user.isPremium) {
            return res.status(400).send({ message: 'You are already on a premium plan.' });
        }

      
        const paymentSuccess = processPayment(paymentDetails);

        if (!paymentSuccess) {
            return res.status(400).send({ message: 'Payment failed. Upgrade to premium was not successful.' });
        }

        // Deactivate the current subscription plan
        if (currentSubscription) {
            currentSubscription.isActive = false;
            await currentSubscription.save();
        }

        // Assign the PremiumLocker plan to the user
        const premiumLockerPlan = await Subscription.findOne({ planName: "PremiumLocker" });
        const newSubscription = new UserSubscription({
            userId: user._id,
            subscriptionId: premiumLockerPlan._id,
            startDate: new Date(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), 
            isActive: true
        });
        await newSubscription.save();

        user.isPremium = true;
        await user.save();

        res.status(200).send({ message: 'Upgrade to PremiumLocker plan successful.' });
    } catch (error) {
        console.error("Upgrade error:", error);
        res.status(500).send({ message: 'Upgrade to premium failed.', error: error.message });
    }
};


module.exports={createBasicLockerPlan}