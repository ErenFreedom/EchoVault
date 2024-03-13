const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const DummyUser = require('../models/DummyUser');
const { generateOtp, sendOtpEmail } = require('../utils/otpService');

const LOGIN_ATTEMPTS_LIMIT = 3;
const OTP_ATTEMPTS_LIMIT = 3;
const LOGIN_LOCKOUT_TIME = 3600000; // 1 hour in milliseconds
const OTP_EXPIRATION_MS = 60000; // 1 minute for OTP expiration
const loginAttemptsStore = new Map();
const JWT_SECRET = process.env.JWT_SECRET;



async function findUserByEmailOrUsername(identifier) {
    let query = {$or: [{email: identifier}, {username: identifier}]};
    let user = await User.findOne(query).exec();
    let userType = 'User';
    if (!user) {
        user = await DummyUser.findOne(query).exec();
        userType = 'DummyUser';
    }
    return { user, userType };
}

// Helper function to record a login attempt and manage OTP generation and sending
function handleLoginAttempt(email, reset = false) {
    let loginAttempt = loginAttemptsStore.get(email);
    if (reset) {
        loginAttemptsStore.delete(email);
    } else {
        if (!loginAttempt) {
            loginAttempt = { count: 1, lockoutTime: null };
        } else {
            loginAttempt.count++;
            if (loginAttempt.count >= LOGIN_ATTEMPTS_LIMIT) {
                loginAttempt.lockoutTime = Date.now();
            }
        }
        loginAttemptsStore.set(email, loginAttempt);
    }
    return loginAttempt;
}

function isLoginLockedOut(email) {
    const loginAttempt = loginAttemptsStore.get(email);
    if (loginAttempt && loginAttempt.lockoutTime) {
        const timeSinceLockout = Date.now() - loginAttempt.lockoutTime;
        if (timeSinceLockout < LOGIN_LOCKOUT_TIME) {
            return true;
        }
        handleLoginAttempt(email, true);
    }
    return false;
}

function generateAndSendOtp(email) {
    const otp = generateOtp();
    const otpRecord = { otp, attempts: 0, expiry: Date.now() + OTP_EXPIRATION_MS };
    otpDetails.set(email, otpRecord);
    sendOtpEmail(email, otp);
    return otpRecord;
}

function verifyOtp(email, inputOtp) {
    const otpRecord = otpDetails.get(email);
    if (!otpRecord || Date.now() > otpRecord.expiry) {
        otpDetails.delete(email);
        return { verified: false, reason: "OTP expired or not found" };
    }
    if (inputOtp !== otpRecord.otp) {
        otpRecord.attempts++;
        if (otpRecord.attempts >= OTP_ATTEMPTS_LIMIT) {
            otpDetails.delete(email);
            return { verified: false, reason: "Exceeded maximum OTP attempts" };
        }
        otpDetails.set(email, otpRecord);
        return { verified: false, reason: "Incorrect OTP" };
    }
    otpDetails.delete(email);
    return { verified: true };
}
const otpDetails = new Map(); // Store OTP details for verification

exports.login = async (req, res) => {
    const { identifier, password } = req.body; // Use 'identifier' to allow both email and username login

    // Check if the login is currently locked out
    if (isLoginLockedOut(identifier)) {
        return res.status(429).json({ message: "Login attempt locked. Try again later." });
    }

    try {
        const { user, userType } = await findUserByEmailOrUsername(identifier);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const loginAttempt = handleLoginAttempt(identifier);
            if (loginAttempt.count >= LOGIN_ATTEMPTS_LIMIT) {
                return res.status(429).json({ message: "Too many failed login attempts. Account locked for 1 hour." });
            } else {
                return res.status(401).json({ message: "Invalid credentials. Please try again.", attemptsLeft: LOGIN_ATTEMPTS_LIMIT - loginAttempt.count });
            }
        }

        // Reset login attempts on successful login
        handleLoginAttempt(identifier, true);

        // Send OTP to user's email
        generateAndSendOtp(user.email);

        res.status(200).json({ message: "OTP sent to your email. Please verify to complete login." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred during the login process." });
    }
};

exports.verifyOtpForLogin = async (req, res) => {
    const { identifier, otp } = req.body;
    
    const { user, userType } = await findUserByEmailOrUsername(identifier);
    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }

    const otpVerificationResult = verifyOtp(user.email, otp);
    if (!otpVerificationResult.verified) {
        return res.status(400).json({ message: otpVerificationResult.reason });
    }

    // OTP verification succeeded, proceed to generate JWT
    const accessToken = jwt.sign({ userId: user._id, userType: userType }, JWT_SECRET, { expiresIn: '15m' }); // Access token
    const refreshToken = jwt.sign({ userId: user._id, userType: userType }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' }); // Refresh token

    // Here, you might want to update the User or DummyUser model to store the refreshToken

    res.json({
        message: "Login successful. Welcome!",
        accessToken: accessToken,
        refreshToken: refreshToken,
        userType: userType // Inform the client about the user type
    });
};

