const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/SubscriptionController');

// Middleware placeholders (for future implementation)
// const authMiddleware = require('../middleware/authMiddleware');

router.post('/upgrade-premium', /* authMiddleware, */ subscriptionController.upgradeToPremium);

module.exports = router;
