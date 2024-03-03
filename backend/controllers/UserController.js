const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const { generateOtp, sendOtpEmail } = require('../utils/otpService');
const otpStorage = new Map(); // This would ideally be replaced with a more persistent storage solution

let failedAttemptsStore = {};

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_TIME_MS = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

// Helper function to record failed attempts
function recordFailedAttempt(userId) {
    if (!failedAttemptsStore[userId]) {
        failedAttemptsStore[userId] = { count: 1, timestamp: Date.now() };
    } else {
        failedAttemptsStore[userId].count += 1;
    }

    // Check if exceeded max attempts and set lockout timestamp
    if (failedAttemptsStore[userId].count >= MAX_FAILED_ATTEMPTS) {
        failedAttemptsStore[userId].lockoutTimestamp = Date.now();
    }
}

// Helper function to check lockout status
function isLockedOut(userId) {
    const record = failedAttemptsStore[userId];
    if (record && record.lockoutTimestamp) {
        const timeSinceLockout = Date.now() - record.lockoutTimestamp;
        if (timeSinceLockout < LOCKOUT_TIME_MS) {
            // Still locked out
            return true;
        } else {
            // Lockout period has expired, reset record
            delete failedAttemptsStore[userId];
        }
    }
    return false;
}


exports.registerUser = async (req, res) => {
    try {
        const { firstName, lastName,age,gender,username, email, password, recovery_email } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ message: 'Email already in use.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user but don't save yet, as we need to verify OTP first
        const newUser = new User({
            firstName,
            lastName,
            age,
            gender,
            username,
            email,
            password: hashedPassword,
            recovery_email,
            
        });

        // Generate OTP and send email
        const otp = generateOtp();
        const otpSent = await sendOtpEmail(email, otp);
        if (!otpSent) {
            return res.status(500).send({ message: 'Failed to send OTP email.' });
        }

        // Store OTP in temporary storage with a 1-minute expiration
        otpStorage.set(email, otp);
        setTimeout(() => otpStorage.delete(email), 60000);

        // Save the newUser to a session or a temporary store
        // Assuming you are using sessions
        req.session.tempUser = newUser;

        res.status(200).send({ message: 'OTP sent to email.', email: email });
    } catch (error) {
        res.status(500).send({ message: 'Registration failed.', error: error.message });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const storedOtp = otpStorage.get(email);
        if (!storedOtp) {
            return res.status(400).send({ message: 'OTP has expired or was not sent.' });
        }

        if (otp !== storedOtp) {
            // Increment attempt count and check if it exceeds the limit
            const attempts = (req.session.attempts || 0) + 1;
            req.session.attempts = attempts;
            if (attempts >= 3) {
                // Lock out the session
                req.session.locked = true;
                return res.status(429).send({ message: 'Too many attempts. Session locked.' });
            }
            return res.status(400).send({ message: 'Incorrect OTP.', attemptsLeft: 3 - attempts });
        }

        // OTP is correct, save the user
        const newUser = req.session.tempUser;
        await newUser.save();

        // Clear the OTP and attempts from the storage and session
        otpStorage.delete(email);
        delete req.session.tempUser;
        delete req.session.attempts;

        // Log the user in or send a success response
        res.status(201).send({ message: 'User registered successfully.' });
    } catch (error) {
        res.status(500).send({ message: 'OTP verification failed.', error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        // Assuming `req.user._id` contains the ID of the currently logged-in user
        const userId = req.user._id;
        const updates = req.body;

        // Fields that the user is allowed to update
        const allowedUpdates = ['phoneNumber', 'address', 'dateOfBirth', 'profilePicture', 'occupationStatus'];
        const isValidOperation = Object.keys(updates).every((update) => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).send({ message: 'Invalid updates!' });
        }

        // Find the user by ID and update
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Update each field with the new values
        Object.keys(updates).forEach((update) => {
            user[update] = updates[update];
        });

        await user.save();

        res.status(200).send({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).send({ message: 'Error updating profile', error: error.message });
    }
};

exports.toggleTheme = async (req, res) => {
    // Assume we have a 'theme' field in the User model where 'light' and 'dark' are possible values
    const user = await User.findById(req.user._id);
    user.theme = user.theme === 'light' ? 'dark' : 'light';
    await user.save();
    res.status(200).json({ message: `Theme changed to ${user.theme}.` });
};

// Update user information
exports.updateUserInfo = async (req, res) => {
    const { currentPassword, updates } = req.body;
    const user = await User.findById(req.user._id);

    // Check for account lockout first
    if (isLockedOut(user._id.toString())) {
        return res.status(429).json({ message: 'Account is temporarily locked due to multiple failed attempts. Please try again later.' });
    }

    // Verify the current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        // Record the failed attempt and check if the account should be locked
        recordFailedAttempt(user._id.toString());
        if (isLockedOut(user._id.toString())) {
            return res.status(429).json({ message: 'Account is now locked due to multiple failed attempts. Please try again later.' });
        }
        return res.status(401).json({ message: 'Password is incorrect.' });
    }

    // Reset attempts on successful operation
    delete failedAttemptsStore[user._id.toString()];

    // Allowed fields to update
    const allowedUpdates = ['firstName', 'lastName', 'age', 'gender', 'username', 'email', 'recovery_email'];
    const updateFields = Object.keys(updates).filter(field => allowedUpdates.includes(field));

    // Apply the updates
    updateFields.forEach(field => user[field] = updates[field]);
    await user.save();

    res.status(200).json({ message: 'User information updated successfully.' });
};


// Change user password
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (isLockedOut(user._id.toString())) {
        return res.status(429).json({ message: 'Account is temporarily locked due to multiple failed attempts. Please try again later.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        recordFailedAttempt(user._id.toString());
        if (isLockedOut(user._id.toString())) {
            return res.status(429).json({ message: 'Account is now locked due to multiple failed attempts. Please try again later.' });
        }
        return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    // Reset attempts on successful password change
    delete failedAttemptsStore[user._id.toString()];

    // Proceed with changing the password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ message: 'Password changed successfully.' });
};

const failedOtpAttemptsStore = new Map(); // Store failed OTP attempts
const OTP_EXPIRATION_TIME = 30 * 1000; // 30 seconds in milliseconds
const LOCKOUT_TIME = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

// Helper function to record a failed OTP attempt and check for lockout
function recordFailedOtpAttempt(email) {
    const attempts = failedOtpAttemptsStore.get(email) || { count: 0, timestamp: Date.now() };
    attempts.count++;
    failedOtpAttemptsStore.set(email, attempts);

    // Check if attempts exceed limit and lockout time hasn't passed
    if (attempts.count >= 3 && (Date.now() - attempts.timestamp) < LOCKOUT_TIME) {
        return true; // Account is locked out
    } else if ((Date.now() - attempts.timestamp) >= LOCKOUT_TIME) {
        // Reset attempts after lockout time passes
        attempts.count = 1;
        attempts.timestamp = Date.now();
        failedOtpAttemptsStore.set(email, attempts);
    }
    return false; // Account is not locked out
}

// Helper function to check if the account is currently locked out
function isOtpLockedOut(email) {
    const attempts = failedOtpAttemptsStore.get(email);
    if (!attempts) return false; // No attempts recorded, not locked out

    const timeSinceFirstAttempt = Date.now() - attempts.timestamp;
    return attempts.count >= 3 && timeSinceFirstAttempt < LOCKOUT_TIME;
}

// Send OTP for account deletion verification
exports.sendDeletionOtp = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }

    // Check if account is locked out before sending another OTP
    if (isOtpLockedOut(user.email)) {
        return res.status(429).json({ message: 'Account is temporarily locked due to multiple failed OTP attempts. Please try again later.' });
    }

    const otp = generateOtp();
    otpStore.set(user.email, { otp, timestamp: Date.now() });
    await sendOtpEmail(user.email, otp);
    res.status(200).json({ message: 'OTP sent to email.' });
};

// Delete account
exports.deleteAccount = async (req, res) => {
    const { otp } = req.body;
    const userEmail = req.user.email;

    if (isOtpLockedOut(userEmail)) {
        return res.status(429).json({ message: 'Account is temporarily locked due to multiple failed OTP attempts. Please try again later.' });
    }

    const otpRecord = otpStore.get(userEmail);
    if (!otpRecord) {
        return res.status(400).json({ message: 'No OTP sent or OTP has expired.' });
    }

    const timeElapsed = Date.now() - otpRecord.timestamp;
    if (timeElapsed > OTP_EXPIRATION_TIME) {
        otpStore.delete(userEmail); // Remove expired OTP
        return res.status(400).json({ message: 'OTP has expired.' });
    }

    if (otp !== otpRecord.otp) {
        if (recordFailedOtpAttempt(userEmail)) {
            return res.status(429).json({ message: 'Account locked due to multiple failed OTP attempts.' });
        }
        return res.status(400).json({ message: 'Invalid OTP.' });
    }

    // OTP is valid, proceed with account deletion
    await User.deleteOne({ _id: req.user._id });
    otpStore.delete(userEmail); // Clean up OTP
    failedOtpAttemptsStore.delete(userEmail); // Reset failed attempts

    res.status(200).json({ message: 'Account deleted successfully.' });
};


module.exports={
    registerUser,
    verifyOtp,
    updateProfile,
    toggleTheme,
    updateUserInfo,
    changePassword,
    deleteAccount,
}