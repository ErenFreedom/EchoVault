const User = require('../models/UserModel');
const DummyUser = require('../models/DummyUser'); // Adjust the path as necessary
const OTP = require('../models/otpModel'); // Adjust the path as needed
const TempUser = require('../models/TempUser');
const UserSubscription = require('../models/UserSubscription');
const Subscription = require('../models/Subscription');
const sendVerificationEmail = require('../utils/sendVerificationEmail');
const Locker = require('../models/Lockers');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');


const { generateOtp, sendOtpEmail } = require('../utils/otpService');

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

        // Check if the email or username already exists in both User and TempUser collections
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        const existingTempUser = await TempUser.findOne({ email });
        if (existingUser || existingTempUser) {
            return res.status(400).send({ message: 'Email or username already in use.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otp = generateOtp();

        // Attempt to send the OTP to the user's email
        const emailSent = await sendOtpEmail(email, otp);
        if (!emailSent) {
            return res.status(500).send({ message: 'Failed to send OTP for email verification.' });
        }

        // Store user details along with the OTP in TempUser collection
        await TempUser.create({
            firstName,
            lastName,
            age,
            gender,
            username,
            email,
            password: hashedPassword, // Store the hashed password
            recovery_email,
            otp
        });

        res.status(200).send({ message: 'Please check your email to verify your account with the OTP sent.' });
    } catch (error) {
        console.error('Registration failed:', error);
        res.status(500).send({ message: 'Registration failed.', error: error.toString() });
    }
};


exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Validate OTP against the TempUser collection
        const tempUserRecord = await TempUser.findOne({ email, otp });
        if (!tempUserRecord) {
            return res.status(400).send({ message: 'OTP is incorrect or has expired.' });
        }

        // Now, move the user from TempUser to User collection
        const { firstName, lastName, age, gender, username, recovery_email, password } = tempUserRecord;
        const newUser = await User.create({
            firstName,
            lastName,
            age,
            gender,
            username,
            email,
            password, // Ensure the password is already hashed
            recovery_email,
            verified: true // Mark the user as verified
        });

        // Assign default subscription plan
        const defaultSubscription = await Subscription.findOne({ planName: "BasicLocker" });
        if (!defaultSubscription) {
            return res.status(500).send({ message: 'Default subscription plan not found.' });
        }

        await UserSubscription.create({
            userId: newUser._id,
            subscriptionId: defaultSubscription._id,
            startDate: new Date(),
            isActive: true
        });

        // Assign default locker, if applicable
        const defaultLocker = await Locker.findOne({ available: true }); // Simplified logic
        if (defaultLocker) {
            defaultLocker.userId = newUser._id;
            defaultLocker.available = false;
            await defaultLocker.save();
        }

        // Clear the OTP record and TempUser record
        await TempUser.deleteOne({ _id: tempUserRecord._id });
        await OTP.deleteOne({ email, otp });

        res.status(201).send({ message: 'User verified successfully.' });
    } catch (error) {
        console.error('OTP verification failed:', error);
        res.status(500).send({ message: 'OTP verification failed.', error: error.toString() });
    }
};


exports.resendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the user has initiated the registration process
        const userExists = await User.findOne({ email });
        if (!userExists) {
            return res.status(404).send({ message: 'User not found. Please initiate the registration process.' });
        }

        // Generate a new OTP
        const otp = generateOtp();

        // Send the OTP via email
        const emailSent = await sendOtpEmail(email, otp);
        if (!emailSent) {
            // Handle failure (e.g., due to email service issues)
            return res.status(500).send({ message: 'Failed to send OTP email.' });
        }

        // Update the existing OTP record or create a new one
        const otpRecord = await OTP.findOne({ email });
        if (otpRecord) {
            otpRecord.otp = otp;
            await otpRecord.save();
        } else {
            await OTP.create({ email, otp });
        }

        res.status(200).send({ message: 'OTP has been resent. Please check your email.' });
    } catch (error) {
        console.error('Error resending OTP:', error);
        res.status(500).send({ message: 'Failed to resend OTP.', error: error.toString() });
    }
};
// exports.verifyOtp = async (req, res) => {
//     const { email, otp } = req.body;
//     try {
//         const otpRecord = await OTP.findOne({ email, otp });
//         if (!otpRecord) {
//             return res.status(400).send({ message: 'OTP is incorrect or has expired.' });
//         }

//         // Retrieve the temporary user data
//         const tempUser = await TempUser.findOne({ email });
//         if (!tempUser) {
//             return res.status(404).send({ message: 'Temporary user data not found.' });
//         }

//         // Create a new user with the verified email and other registration data
//         const newUser = await User.create({
//             ...tempUser.toObject(),
//             email // Ensure email is verified
//         });

//         console.log(`New user ${newUser.email} registered successfully.`);

//         // Associate the BasicLockerPlan with the new user
//         const basicLockerPlan = await Subscription.findOne({ planName: "BasicLocker" });
//         if (!basicLockerPlan) {
//             return res.status(500).send({ message: 'BasicLocker plan not found.' });
//         }

//         const userSubscription = await UserSubscription.create({
//             userId: newUser._id,
//             subscriptionId: basicLockerPlan._id,
//             startDate: new Date(),
//             isActive: true
//         });

//         console.log(`User subscription created: ${userSubscription._id}`);

//         // Clear the OTP as it's no longer needed
//         await tempUser.remove();
//         await otpRecord.remove();

//         // Generate JWT token for the user
//         res.status(201).send({
//             message: 'User registered and verified successfully.'
//             // If using JWT: , authToken: authToken
//         });

//     } catch (error) {
//         console.error('OTP verification failed: ', error);
//         res.status(500).send({ message: 'OTP verification failed.', error: error.toString() });
//     }
// };

// // ... other imports and setup ...

// exports.resendOtp = async (req, res) => {
//     const { email } = req.body;

//     try {
//         // Generate a new OTP
//         const newOtp = generateOtp();

//         // Attempt to send the new OTP to the user's email
//         const otpSent = await sendOtpEmail(email, newOtp);
//         if (!otpSent) {
//             // If there was an error sending the email, don't update the database
//             return res.status(500).send({ message: 'Failed to resend OTP email.' });
//         }

//         // If email was sent successfully, update or insert the new OTP in the database
//         await OTP.findOneAndUpdate({ email }, { otp: newOtp }, { new: true, upsert: true });

//         // Respond to the client indicating the new OTP was sent
//         res.status(200).send({ message: 'New OTP sent to email.', email: email });
//     } catch (error) {
//         console.error('Error resending OTP:', error);
//         res.status(500).send({ message: 'Error resending OTP.', error: error.toString() });
//     }
// };



exports.updateProfile = async (req, res) => {
    try {
        // Assuming `req.user._id` contains the ID of the currently logged-in user
        const userId = req.user._id;
        const updates = req.body;

        
        const allowedUpdates = ['phoneNumber', 'address', 'dateOfBirth', 'profilePicture', 'occupationStatus'];
        const isValidOperation = Object.keys(updates).every((update) => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).send({ message: 'Invalid updates!' });
        }

        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        
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


