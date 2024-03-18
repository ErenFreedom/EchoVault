const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/PaymentController');
const authMiddleware = require('../middleware/authMiddleware'); // Ensure you have implemented this middleware

// Route to create a simulated PaymentIntent
router.post('/create-payment-intent', authMiddleware, paymentController.createPaymentIntent);

// Route to upgrade user to premium after successful payment simulation
router.post('/upgrade-to-premium', authMiddleware, paymentController.upgradeToPremium);

module.exports = router;
