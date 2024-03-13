const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/PaymentController');

// Middleware placeholders (for future implementation)
// const authMiddleware = require('../middleware/authMiddleware');

// Route to create a Stripe PaymentIntent
router.post('/create-payment-intent', /* authMiddleware, */ paymentController.createPaymentIntent);

// Route to upgrade user to premium after successful payment
router.post('/upgrade-to-premium', /* authMiddleware, */ paymentController.upgradeToPremium);

module.exports = router;
