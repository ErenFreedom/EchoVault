const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { ensureAuthenticated, ensureIsNormalUser } = require('../middleware/authMiddleware');

// Route to create a Stripe PaymentIntent
router.post('/create-payment-intent', ensureAuthenticated, ensureIsNormalUser, paymentController.createPaymentIntent);

// Route to upgrade user to premium after successful payment
router.post('/upgrade-to-premium', ensureAuthenticated, ensureIsNormalUser, paymentController.upgradeToPremium);

module.exports = router;
