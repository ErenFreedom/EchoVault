const User = require('../models/UserModel');
const DummyUser = require('../models/DummyUser');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { generateOtp, sendOtpEmail } = require('../utils/otpService');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const otpStorage = new Map(); // For simplicity, consider using a more persistent storage solution
const lockoutStorage = new Map();

const LOCKOUT_TIME_MS = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
const MAX_ATTEMPTS = 3;

function checkLockout(userEmail) {
    const lockoutInfo = lockoutStorage.get(userEmail);
    if (!lockoutInfo) return false; // Not locked out

    const currentTime = Date.now();
    if (currentTime < lockoutInfo.until) {
        return true; // Currently locked out
    }

    // Lockout expired, remove entry
    lockoutStorage.delete(userEmail);
    return false;
}

// Helper function to record a failed attempt or initiate a lockout
function recordFailedAttempt(userEmail) {
    const lockoutInfo = lockoutStorage.get(userEmail) || { attempts: 0, until: null };
    lockoutInfo.attempts += 1;

    if (lockoutInfo.attempts >= MAX_ATTEMPTS) {
        lockoutInfo.until = Date.now() + LOCKOUT_TIME_MS; // Set lockout time
        lockoutStorage.set(userEmail, lockoutInfo);
        return true; // Lockout initiated
    }

    lockoutStorage.set(userEmail, lockoutInfo);
    return false; // No lockout, just recording the attempt
}

const sendVerificationEmail = async (email, token) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // Correctly point to your backend
    const verificationUrl = `http://localhost:3001/api/dummy-users/confirm-registration?token=${token}`;

    const mailOptions = {
        from: `"Your Service Name" <${process.env.EMAIL_USERNAME}>`,
        to: email,
        subject: 'Confirm Your Registration',
        html: `<p>Please confirm your registration by clicking on the link below:</p><a href="${verificationUrl}">Confirm Registration</a>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully.');
        return true;
    } catch (error) {
        console.error('Error sending verification email:', error);
        return false;
    }
};



// Import jsonwebtoken at the top of your controller file


exports.registerDummyUser = async (req, res) => {
    const { firstName, lastName, age, gender, username, email, recoveryEmail, password, premiumUsername, phoneNumber } = req.body;

    if (checkLockout(email)) {
        return res.status(429).json({ message: "Too many failed registration attempts. Please try again later." });
    }

    try {
        // Check if the email or username is already used by a premium/normal user
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: "Email or username already in use by a premium/normal user." });
        }

        // Check if the email or username is already used by another dummy user
        const existingDummyUser = await DummyUser.findOne({ $or: [{ email }, { username }] });
        if (existingDummyUser) {
            return res.status(400).json({ message: "Email or username already in use by another dummy user." });
        }

        // Find the premium user by username to link the dummy user to
        const premiumUser = await User.findOne({ username: premiumUsername, isPremium: true });
        if (!premiumUser) {
            return res.status(400).json({ message: `Premium account ${premiumUsername} not found.` });
        }

        // Proceed with creating the dummy user and sending a verification email
        const hashedPassword = await bcrypt.hash(password, 10);
        const registrationToken = jwt.sign({
            firstName, lastName, age, gender, username, email, recoveryEmail, phoneNumber, password: hashedPassword, linkedPremiumUserId: premiumUser._id
        }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const emailSent = await sendVerificationEmail(premiumUser.email, registrationToken);
        if (!emailSent) {
            return res.status(500).json({ message: "Failed to send verification email." });
        }

        res.status(200).json({ message: 'Verification email sent. Please check your inbox to complete registration.' });
    } catch (error) {
        recordFailedAttempt(email);
        console.error('Error during registration:', error);
        res.status(500).json({ message: "An error occurred during registration.", error: error.toString() });
    }
};


exports.confirmRegistration = async (req, res) => {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const existingDummyUser = await DummyUser.findOne({ email: decoded.email });
        if (existingDummyUser) {
            return res.status(400).json({ message: "This dummy user has already been registered." });
        }

        const dummyUser = new DummyUser({
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            age: decoded.age,
            gender: decoded.gender,
            username: decoded.username,
            email: decoded.email,
            recovery_email: decoded.recoveryEmail, // Ensure this matches the schema field name
            phoneNumber: decoded.phoneNumber,
            password: decoded.password,
            linkedTo: decoded.linkedPremiumUserId // Make sure this is correctly named as per your schema
        });

        await dummyUser.save();

        res.status(200).json({ message: "Dummy user registered successfully." });
    } catch (error) {
        console.error('Error confirming registration:', error);
        res.status(500).json({ message: "Failed to confirm registration.", error: error.toString() });
    }
};







exports.toggleThemeDummyUser = async (req, res) => {
    const dummyUser = await DummyUser.findById(req.user._id);
    dummyUser.theme = dummyUser.theme === 'light' ? 'dark' : 'light';
    await dummyUser.save();
    res.status(200).json({ message: `Theme changed to ${dummyUser.theme}.` });
};

exports.updateDummyUserInfo = async (req, res) => {
    const { currentPassword, updates } = req.body;
    const dummyUser = await DummyUser.findById(req.user._id);

    if (checkLockout(dummyUser._id)) {
        return res.status(429).json({ message: 'Account is temporarily locked due to multiple failed attempts. Please try again later.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, dummyUser.password);
    if (!isMatch) {
        const isLockedOut = recordFailedAttempt(dummyUser._id);
        if (isLockedOut) {
            return res.status(429).json({ message: 'Account locked due to multiple failed password attempts. Please try again later.' });
        } else {
            return res.status(401).json({ message: 'Password is incorrect.' });
        }
    }

    // Proceed with updating allowed fields
    const allowedUpdates = ['firstName', 'lastName', 'age', 'gender', 'username', 'email', 'recoveryEmail'];
    Object.keys(updates).forEach(field => {
        if (allowedUpdates.includes(field)) {
            dummyUser[field] = updates[field];
        }
    });

    await dummyUser.save();
    res.status(200).json({ message: 'User information updated successfully.' });
};


exports.changeDummyUserPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id; // Use userId for lockout tracking

    if (isLockedOut(userId.toString())) {
        return res.status(429).json({ message: 'Account is temporarily locked due to multiple failed attempts. Please try again later.' });
    }

    const dummyUser = await DummyUser.findById(userId);

    const isMatch = await bcrypt.compare(currentPassword, dummyUser.password);
    if (!isMatch) {
        const lockedOut = recordFailedAttempt(userId.toString());
        if (lockedOut) {
            return res.status(429).json({ message: 'Account is temporarily locked due to multiple failed attempts. Please try again later.' });
        } else {
            // Provide feedback on remaining attempts if not locked out
            const { attempts } = lockoutStore.get(userId.toString()) || { attempts: 0 };
            return res.status(401).json({ message: 'Current password is incorrect.', attemptsLeft: MAX_ATTEMPTS - attempts });
        }
    }

    // Hash and update the new password
    dummyUser.password = await bcrypt.hash(newPassword, 10);
    await dummyUser.save();

    // Reset attempts on successful password change
    lockoutStore.set(userId.toString(), { attempts: 0, lockoutTime: null });

    res.status(200).json({ message: 'Password changed successfully.' });
};


exports.unlinkDummyUserAccount = async (req, res) => {
    const { otp } = req.body;
    const userEmail = req.user.email; // Email from the currently logged-in dummy user

    // Check if the account is currently locked out due to previous failed attempts
    if (checkLockout(userEmail)) {
        return res.status(403).send({ message: 'Account is temporarily locked due to multiple failed attempts.' });
    }

    const storedOtp = otpStorage.get(userEmail);
    if (!storedOtp || storedOtp !== otp) {
        const isLockedOut = recordFailedAttempt(userEmail);
        const message = isLockedOut ? 'Account locked due to multiple failed OTP attempts.' : 'Invalid or expired OTP.';
        return res.status(400).send({ message });
    }

    // OTP is valid, proceed to unlink (delete) the dummy user account
    await DummyUser.deleteOne({ _id: req.user._id });
    otpStorage.delete(userEmail);

    // Retrieve the dummy user to get the premium user's ObjectId
    const dummyUser = await DummyUser.findById(req.user._id).populate('linkedTo', 'email');
    if (!dummyUser) {
        return res.status(404).send({ message: 'Dummy user not found.' });
    }

    // Notify the premium user about the unlinking
    const premiumUserEmail = dummyUser.linkedTo.email; // Assuming 'linkedTo' is the reference to the premium user
    await sendEmail(premiumUserEmail, `${req.user.username} has unlinked their account.`);

    res.status(200).json({ message: 'Account unlinked successfully.' });
};


