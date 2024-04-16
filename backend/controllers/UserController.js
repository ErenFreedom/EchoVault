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
let passwordChangeAttemptsStore = new Map();
let failedAttemptsStore = {};
const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_TIME_MS = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
const failedOtpAttemptsStore = new Map(); // Store failed OTP attempts
const OTP_EXPIRATION_TIME = 30 * 1000; // 30 seconds in milliseconds
// Helper function to record failed attempts
function recordFailedAttempt(email) {
    const attempts = passwordChangeAttemptsStore.get(email) || { count: 0, timestamp: Date.now() };
    attempts.count++;
    passwordChangeAttemptsStore.set(email, attempts);

    // Check if the account should be locked
    if (attempts.count >= MAX_FAILED_PASSWORD_CHANGE_ATTEMPTS && (Date.now() - attempts.timestamp) < PASSWORD_CHANGE_LOCKOUT_TIME_MS) {
        return true; // Account is locked
    } else if ((Date.now() - attempts.timestamp) >= PASSWORD_CHANGE_LOCKOUT_TIME_MS) {
        // Reset the attempts after the lockout time has passed
        attempts.count = 1;
        attempts.timestamp = Date.now();
        passwordChangeAttemptsStore.set(email, attempts);
    }
    return false; // Account is not locked
}

function clearFailedAttempts(email) {
    if (passwordChangeAttemptsStore.has(email)) {
        passwordChangeAttemptsStore.delete(email); // Clear the failed attempt record
    }
}
// Helper function to check lockout status
function isLockedOut(email) {
    const attempts = passwordChangeAttemptsStore.get(email);
    if (!attempts) return false; // No attempts recorded means not locked

    // Determine if the account is still within the lockout time window
    return (attempts.count >= MAX_FAILED_PASSWORD_CHANGE_ATTEMPTS) && ((Date.now() - attempts.timestamp) < PASSWORD_CHANGE_LOCKOUT_TIME_MS);
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
        const lockerTypes = [
            'Personal',
            'Medical',
            'Finance',
            'Education',
            'Property',
            'Travel',
            'Legal',
        ];

        const userLockers = lockerTypes.map(lockerType => ({
            lockerName: `${lockerType} Locker`,
            lockerType,
            userId: newUser._id, // Assign the locker to the new user
        }));

        // Create lockers for the new user
        await Locker.insertMany(userLockers);

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
        // Check if the user has initiated the registration process and exists in either User or TempUser collections
        let userExists = await User.findOne({ email });
        let tempUserExists = await TempUser.findOne({ email });

        if (!userExists && !tempUserExists) {
            return res.status(404).send({ message: 'User not found. Please initiate the registration process.' });
        }

        // Generate a new OTP
        const otp = generateOtp();

        // Send the OTP via email
        const emailSent = await sendOtpEmail(email, otp);
        if (!emailSent) {
            return res.status(500).send({ message: 'Failed to send OTP email.' });
        }

        // Determine which collection to update based on where the user is found
        let otpRecord;
        if (tempUserExists) {
            otpRecord = tempUserExists;
        } else {
            otpRecord = await OTP.findOne({ email });
        }

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


exports.getLinkedGuestAccounts = async (req, res) => {
    const premiumUserId = req.params.userId; // Extract premium user ID from request parameters

    try {
        const linkedGuestAccounts = await User.find({
            linkedTo: premiumUserId,
            isGuestUser: true
        }, 'firstName email'); // Selecting necessary fields

        res.json(linkedGuestAccounts); 
    } catch (error) {
        console.error("Error fetching linked guest accounts: ", error);
        res.status(500).json({ message: "Error fetching linked guest accounts", error: error.toString() });
    }
};


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
    // Ensure that req.user is populated correctly by your auth middleware
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized: User not found." });
    }

    const userId = req.user.id; // Retrieved from the decoded JWT token
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }

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

    // Allowed fields to update, excluding 'email'
    const allowedUpdates = ['firstName', 'lastName', 'age', 'gender', 'username', 'recovery_email'];
    const updateFields = Object.keys(updates).filter(field => allowedUpdates.includes(field) && updates[field] !== undefined);

    // Apply the updates
    updateFields.forEach(field => {
        user[field] = updates[field];
    });
    await user.save();

    res.status(200).json({ message: 'User information updated successfully.' });
};


// Change user password
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Ensure that req.user is populated correctly by your auth middleware
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized: User not found." });
    }

    const userId = req.user.id; // Retrieved from the decoded JWT token
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }

    // Assume a similar mechanism for password change attempts as for OTP
    if (failedOtpAttemptsStore.get(user.email) && recordFailedOtpAttempt(user.email)) {
        return res.status(429).json({ message: 'Account is temporarily locked due to multiple failed attempts. Please try again later.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        // Record a failed attempt. Assuming a function similar to recordFailedOtpAttempt could be used.
        // Ensure there's logic to record failed password change attempts
        recordFailedAttempt(user.email); // Adjust according to how you handle failed attempts

        return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    // If we've got here, the current password is correct, and the account isn't locked out, so proceed.
    user.password = await bcrypt.hash(newPassword, 10); // Hash the new password
    await user.save(); // Save the updated user object to the database

    // Optionally, clear any failed attempt records for this user
    clearFailedAttempts(user.email); // This function needs to be defined to clear the record

    res.json({ message: 'Password changed successfully.' });
};



// Helper function to record a failed OTP attempt and check for lockout

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
    const { currentPassword } = req.body;
    
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized: No user ID provided." });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    // Delete the user account
    await User.deleteOne({ _id: user._id });

    res.status(200).json({ message: 'Account deleted successfully.' });
};


