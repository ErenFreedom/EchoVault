const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/UserModel');
const UserSubscription = require('../models/UserSubscription');
const Subscription = require('../models/Subscription');

// Function to create a Stripe PaymentIntent
exports.createPaymentIntent = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.isPremium) {
            return res.status(403).json({ message: "User is already a premium member." });
        }

        // Assuming "PremiumLocker" is the subscription plan you want users to purchase
        const premiumPlan = await Subscription.findOne({ planName: "PremiumLocker" });
        if (!premiumPlan) {
            return res.status(404).json({ message: "Premium plan not found." });
        }

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: premiumPlan.price * 100, // Stripe expects the amount in cents
            currency: 'usd',
            metadata: { userId: user._id.toString() },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while creating payment intent.", error: error.message });
    }
};

// Function to upgrade user to premium after successful payment
exports.upgradeToPremium = async (req, res) => {
    try {
        // Retrieve the user ID from the request; ensure authentication and authorization
        const userId = req.user._id; // Use the authenticated user's ID

        // Fetch the premium subscription plan details
        const premiumSubscription = await Subscription.findOne({ planName: "PremiumLocker" });
        if (!premiumSubscription) {
            return res.status(404).json({ message: "Premium subscription plan not found." });
        }

        // Upgrade the user to premium
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.isPremium) {
            return res.status(400).json({ message: "User is already a premium member." });
        }

        user.isPremium = true;
        await user.save();

        // Create or update the user's subscription details
        const endDate = new Date(); // Calculate the end date based on the subscription duration
        endDate.setMonth(endDate.getMonth() + premiumSubscription.duration);

        let userSubscription = await UserSubscription.findOne({ userId: userId });
        if (userSubscription) {
            // Update existing subscription if exists
            userSubscription.subscriptionId = premiumSubscription._id;
            userSubscription.startDate = new Date();
            userSubscription.endDate = endDate;
            userSubscription.isActive = true;
        } else {
            // Create new subscription
            userSubscription = new UserSubscription({
                userId: userId,
                subscriptionId: premiumSubscription._id,
                startDate: new Date(),
                endDate: endDate,
                isActive: true
            });
        }
        await userSubscription.save();

        res.json({ message: "User upgraded to Premium successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error upgrading to Premium.", error: error.toString() });
    }
};


module.exports={
    createPaymentIntent,
    upgradeToPremium
}