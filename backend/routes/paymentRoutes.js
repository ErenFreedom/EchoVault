const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/PaymentController');
const authMiddleware = require('../middleware/authMiddleware');

// Add route for upgrading to premium, ensuring the user is authenticated first
router.post('/upgrade-to-premium', paymentController.upgradeToPremium);

module.exports = router;
