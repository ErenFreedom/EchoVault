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
                return next(); 
            }
            return res.status(400).json({ message: "You are already logged in." });
        });
    } else {
        next(); 
    }
}

router.post('/login', isLoggedIn, authController.login);
router.post('/login-guest',isLoggedIn, authController.loginDummyUser);

router.post('/logout', authMiddleware, authController.logout);


module.exports = router;
