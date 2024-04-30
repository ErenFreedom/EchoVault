const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/PaymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/upgrade-to-premium', paymentController.upgradeToPremium);

module.exports = router;
