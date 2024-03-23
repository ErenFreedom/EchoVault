const User = require('../models/UserModel');
const UserSubscription = require('../models/UserSubscription');
const Subscription = require('../models/Subscription');

const jwt = require('jsonwebtoken');
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
        const { firstName, lastName, age, gender, username, email, password, recovery_email } = req.body;

        // Check if registered email is the same as recovery email
        if (email === recovery_email) {
            return res.status(400).send({ message: 'Registered email cannot be the same as recovery email.' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ message: 'Email already in use.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user document
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

        // Assuming you are using sessions
        req.session.tempUser = newUser;

        // Find the "BasicLocker" subscription plan
        const basicLockerPlan = await Subscription.findOne({ planName: "BasicLocker" });
        if (!basicLockerPlan) {
            console.error("BasicLocker plan not found.");
            return res.status(500).send({ message: 'BasicLocker plan not found.' });
        }

        // Save the plan ID for later use after OTP verification
        req.session.basicLockerPlanId = basicLockerPlan._id;

        res.status(200).send({ message: 'OTP sent to email.', email: email });
    } catch (error) {
        res.status(500).send({ message: 'Registration failed.', error: error.message });
    }
};



exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        console.log(`Attempting to verify OTP for email: ${email} with OTP: ${otp}`);

        const storedOtp = otpStorage.get(email);
        console.log(`Stored OTP for ${email}:`, storedOtp);

        if (!storedOtp || otp !== storedOtp.toString()) {
            console.log(`OTP verification failed for ${email}. Input OTP: ${otp}, Stored OTP: ${storedOtp}`);
            // Handle incorrect or expired OTP...
            return res.status(400).send({ message: 'OTP is incorrect or has expired.' });
        }
        console.log(`OTP verification succeeded for ${email}. Proceeding with user registration.`);


        const tempUser = req.session.tempUser;

        if (!tempUser) {
            console.log("Session data missing for OTP verification. Current session:", req.session);
            return res.status(400).send({ message: "User session data not found." });
        }
        console.log("Temp user session data found:", tempUser);


        // Recreate the mongoose document (model instance) from the session's stored data
        const newUser = new User(tempUser);

        // Now attempt to save it
        await newUser.save();
        console.log(`New user ${newUser.email} registered successfully.`);

        // Associate the BasicLockerPlan with the new user
        const basicLockerPlan = await Subscription.findOne({ planName: "BasicLocker" });
        if (!basicLockerPlan) {
            return res.status(500).send({ message: 'BasicLocker plan not found.' });
        }

        const userSubscription = new UserSubscription({
            userId: newUser._id,
            subscriptionId: basicLockerPlan._id,
            startDate: new Date(),
            isActive: true
        });
        await userSubscription.save();

        // Clean up the session
        delete req.session.tempUser;
        delete req.session.attempts; // if you are tracking attempts in session
        otpStorage.delete(email); // Clear the OTP
        console.log(`Session and OTP storage cleaned up for ${email}.`);

        // Generate JWT token for the user
        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Respond with JWT token
        res.status(201).send({
            message: 'User registered and verified successfully.',
            token: token
        });

    } catch (error) {
        console.error('OTP verification failed: ', error);
        res.status(500).send({ message: 'OTP verification failed.', error: error.toString() });
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


