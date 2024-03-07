const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { ensureAuthenticated, ensureIsNormalUser } = require('../middleware/authMiddleware');

// Route to handle the upgrade to a premium subscription.
// ensureAuthenticated is a middleware that checks if the user is logged in.
// ensureIsNormalUser is a hypothetical middleware that checks if the user is a normal user and not already a premium or dummy user.
router.post('/upgrade-to-premium', ensureAuthenticated, ensureIsNormalUser, subscriptionController.upgradeToPremium);

module.exports = router;
