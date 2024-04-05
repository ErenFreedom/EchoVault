const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const authController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/authMiddleware');

function isLoggedIn(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return next(); // Proceed if the token is invalid
            }
            // User is already logged in
            return res.status(400).json({ message: "You are already logged in." });
        });
    } else {
        next(); // No token, user not logged in, proceed
    }
}

// Apply isLoggedIn middleware to the login route to prevent already logged-in users from logging in again
router.post('/login', isLoggedIn, authController.login);

// Route for verifying OTP as part of the login process
// router.post('/verify-otp', authController.verifyOtpForLogin);

router.post('/logout', authMiddleware, authController.logout);


module.exports = router;
