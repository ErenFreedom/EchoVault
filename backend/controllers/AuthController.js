require('dotenv').config();
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
    const otpRecord = { otp, attempts: 0, expiry: Date.now() + 60000 }; // 1 minute for OTP expiration
    otpDetails.set(email, otpRecord);

    console.log(`OTP generated for ${email}: `, otp);
    console.log(`OTP record: `, otpRecord);

    sendOtpEmail(email, otp);
}


function verifyOtp(email, inputOtp) {
    const otpRecord = otpDetails.get(email);
    if (!otpRecord || Date.now() > otpRecord.expiry) {
        otpDetails.delete(email);
        console.log("OTP expired or not found for email:", email);
        return { verified: false, reason: "OTP expired or not found" };
    }

    console.log("OTP to verify:", inputOtp);
    console.log("Stored OTP:", otpRecord.otp);

    if (inputOtp.toString() !== otpRecord.otp.toString()) {
        otpRecord.attempts++;
        if (otpRecord.attempts >= 3) { // Assuming a maximum of 3 OTP attempts
            otpDetails.delete(email);
            console.log("Exceeded maximum OTP attempts for email:", email);
            return { verified: false, reason: "Exceeded maximum OTP attempts" };
        }
        otpDetails.set(email, otpRecord);
        console.log("Incorrect OTP for email:", email);
        return { verified: false, reason: "Incorrect OTP" };
    }

    otpDetails.delete(email);
    console.log("OTP verified successfully for email:", email);
    return { verified: true };
}
const otpDetails = new Map(); // Store OTP details for verification

exports.login = async (req, res) => {
    const { identifier, password } = req.body;

    // Check if the login is currently locked out
    if (isLoginLockedOut(identifier)) {
        return res.status(429).json({ message: "Login attempt locked. Try again later." });
    }

    try {
        const { user, userType } = await findUserByEmailOrUsername(identifier);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if user is already logged in
        if (user.loggedIn) {
            return res.status(400).json({ message: "User already logged in. Please log out before attempting to log in again." });
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

        // Proceed to send OTP to user's email
        generateAndSendOtp(user.email);

        // Optionally, mark the user as in the process of logging in (but not yet logged in)
        // Note: Make sure to clear this flag on successful OTP verification or on logout
        user.loggedIn = true;
        await user.save();

        res.status(200).json({ message: "OTP sent to your email. Please verify to complete login." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred during the login process." });
    }
};

exports.verifyOtpForLogin = async (req, res) => {
    const { identifier, otp } = req.body;

    console.log(`Verifying OTP for identifier: ${identifier}, OTP: ${otp}`);

    const { user, userType } = await findUserByEmailOrUsername(identifier);
    if (!user) {
        console.log("User not found.");
        return res.status(404).json({ message: "User not found." });
    }

    // Verify the OTP
    const otpVerificationResult = verifyOtp(user.email, otp);
    console.log(`OTP Verification Result:`, otpVerificationResult);

    if (!otpVerificationResult.verified) {
        return res.status(400).json({ message: otpVerificationResult.reason });
    }

    // Here's where you include the userId in the token payload
    const accessToken = jwt.sign(
        { userId: user._id.toString(), userType: userType },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }  // Adjust expiresIn as per your requirement
    );

    const refreshToken = jwt.sign(
        { userId: user._id.toString(), userType: userType },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }  // Adjust expiresIn as per your requirement
    );

    // Optionally update user to reflect logged-in status
    user.isLoggedIn = true; // Assuming you have a field to indicate this
    await user.save();

    console.log(`Login successful for user: ${user.email}`);

    res.json({
        message: "Login successful. Welcome!",
        accessToken: accessToken,
        refreshToken: refreshToken,
        userType: userType
    });
};

exports.logout = async (req, res) => {
    try {
        // Assuming req.user is populated by your authentication middleware
        const userId = req.user._id;

        // Optional: Invalidate the user's refresh token if you're storing and managing these server-side.
        // This example assumes you have a method to mark a refresh token as invalidated.
        // await invalidateUserRefreshToken(userId);

        res.json({ message: "Logout successful." });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: "An error occurred during the logout process." });
    }
};
