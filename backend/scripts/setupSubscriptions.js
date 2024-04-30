const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Subscription = require('../models/Subscription'); 

const createBasicLockerPlan = async () => {
    const basicLockerExists = await Subscription.findOne({ planName: "BasicLocker" });

    if (!basicLockerExists) {
        const basicLockerPlan = new Subscription({
            planName: "BasicLocker",
            price: 0, // Free plan
            duration: Infinity, 
            features: ["10 documents per Locker", "Max file size 25MB", "Formats: jpg, jpeg, pdf, docx"],
            isActive: true,
            storageLimit: 10, 
            fileSizeLimit: 25, 
            lockerLimit: 1, 
            premiumFeatures: [],
            accountLinkingLimit: 0, 
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
            price: 15, 
            duration: 1, 
            features: ["Unlimited custom lockers", "Link up to 3 accounts", "Upload up to 100MB per file", "50 documents per locker"],
            isActive: true,
            storageLimit: 100, 
            fileSizeLimit: 100, 
            lockerLimit: Infinity, 
            premiumFeatures: ["CustomLockerCreation", "AccountLinking", "IncreasedStorageAndDocumentLimits"],
            accountLinkingLimit: 3, 
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
