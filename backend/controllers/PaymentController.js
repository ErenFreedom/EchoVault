const User = require('../models/UserModel');
const UserSubscription = require('../models/UserSubscription');
const Subscription = require('../models/Subscription');

// Simulated function to create a "payment intent"
exports.createPaymentIntent = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.isPremium) {
            return res.status(403).json({ message: "User is already a premium member." });
        }

        // Assuming "PremiumLocker" is the subscription plan you want users to simulate purchasing
        const premiumPlan = await Subscription.findOne({ planName: "PremiumLocker" });
        if (!premiumPlan) {
            return res.status(404).json({ message: "Premium plan not found." });
        }

        // Simulate creating a PaymentIntent by sending a fake client secret
        res.json({ message: "Fake payment intent created. Proceed to 'payment'.", clientSecret: "simulatedClientSecret" });
    } catch (error) {
        console.error("Error simulating payment intent creation:", error);
        res.status(500).json({ message: "An error occurred.", error: error.message });
    }
};

// Function to simulate upgrading user to premium after "successful payment"
exports.upgradeToPremium = async (req, res) => {
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.isPremium) {
            return res.status(400).json({ message: "User is already a premium member." });
        }

        user.isPremium = true;
        await user.save();

        // Assuming here we would update or create a subscription record for the user
        let userSubscription = await UserSubscription.findOne({ userId: userId });

        if (!userSubscription) {
            userSubscription = new UserSubscription({
                userId: userId,
                isActive: true,
                // Add additional fields as necessary, e.g., startDate, endDate, subscriptionId
            });
        } else {
            // Update the existing subscription as necessary
            userSubscription.isActive = true;
        }

        await userSubscription.save();

        res.json({ message: "User upgraded to Premium successfully." });
    } catch (error) {
        console.error("Error upgrading to Premium:", error);
        res.status(500).json({ message: "Error upgrading to Premium.", error: error.toString() });
    }
};
