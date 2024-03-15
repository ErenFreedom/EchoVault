const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
// Make sure this path points to your .env file correctly
const mongoose = require('mongoose');
const Subscription = require('../models/Subscription'); // Update the path to where your Subscription model is defined

const createBasicLockerPlan = async () => {
    const basicLockerExists = await Subscription.findOne({ planName: "BasicLocker" });

    if (!basicLockerExists) {
        const basicLockerPlan = new Subscription({
            planName: "BasicLocker",
            price: 0, // Free plan
            duration: Infinity, // Represents an indefinite duration
            features: ["10 documents per Locker", "Max file size 25MB", "Formats: jpg, jpeg, pdf, docx"],
            isActive: true,
            storageLimit: 10, // 10 documents per locker
            fileSizeLimit: 25, // Max file size 25MB
            lockerLimit: 1, // Number of basic lockers available
            premiumFeatures: [],
            accountLinkingLimit: 0, // No account linking allowed
        });

        await basicLockerPlan.save();
        console.log("BasicLocker plan created successfully.");
    } else {
        console.log("BasicLocker plan already exists.");
    }
};

const createPremiumLockerPlan = async () => {
    const premiumLockerExists = await Subscription.findOne({ planName: "PremiumLocker" });

    if (!premiumLockerExists) {
        const premiumLockerPlan = new Subscription({
            planName: "PremiumLocker",
            price: 15, // 15 dollars per month
            duration: 1, // 1 month duration
            features: ["Unlimited custom lockers", "Link up to 3 accounts", "Upload up to 100MB per file", "50 documents per locker"],
            isActive: true,
            storageLimit: 100, // 100MB storage limit
            fileSizeLimit: 100, // Max file size 100MB
            lockerLimit: Infinity, // Unlimited lockers
            premiumFeatures: ["CustomLockerCreation", "AccountLinking", "IncreasedStorageAndDocumentLimits"],
            accountLinkingLimit: 3, // Can link up to 3 accounts
        });

        await premiumLockerPlan.save();
        console.log("PremiumLocker plan created successfully.");
    } else {
        console.log("PremiumLocker plan already exists.");
    }
};

const main = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        await createBasicLockerPlan();
        await createPremiumLockerPlan();
    } catch (error) {
        console.error("Error setting up subscription plans:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
};

main();
