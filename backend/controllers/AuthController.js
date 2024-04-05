require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const DummyUser = require('../models/DummyUser');
const { generateOtp, sendOtpEmail } = require('../utils/otpService');
const TempLogin = require('../models/TempLogin'); 
const OTP = require('../models/otpModel'); // Update with the correct path

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

// Assuming sendOtpEmail correctly sends the email and logs any issues
// Adjusted function to include userId in the TempLogin document
// async function generateAndSendOtp(email, userId) {
//     const otp = generateOtp();
//     try {
//         // Delete existing OTP record for the email, if any
//         await TempLogin.findOneAndDelete({ email });
//         // Save the new OTP record including userId
//         await TempLogin.create({ email, userId, otp });
//         // Send OTP via email
//         await sendOtpEmail(email, otp);
//     } catch (error) {
//         console.error("Error generating or sending OTP:", error);
//         throw new Error('Failed to send OTP.');
//     }
// }




// async function verifyOtpFromDB(email, inputOtp) {
//     try {
//         const otpRecord = await OTP.findOne({ email, otp: inputOtp });
//         if (!otpRecord) {
//             return { verified: false, reason: "OTP is incorrect or has expired." };
//         }
//         await otpRecord.remove(); // OTP is valid, remove it to prevent reuse
//         return { verified: true };
//     } catch (error) {
//         console.error("Error during OTP verification:", error);
//         return { verified: false, reason: "An error occurred during OTP verification." };
//     }
// }

// async function verifyOtp(email, inputOtp) {
//     try {
//         const otpRecord = await OTP.findOne({ email: email, otp: inputOtp });

//         if (!otpRecord) {
//             return { verified: false, reason: "OTP is incorrect or has expired." };
//         }

//         // If the OTP record exists and matches, it's considered verified.
//         // Optionally, delete the OTP record once verified to prevent reuse.
//         await otpRecord.remove();

//         return { verified: true };
//     } catch (error) {
//         console.error("Error during OTP verification: ", error);
//         return { verified: false, reason: "An error occurred during OTP verification." };
//     }
// }


exports.login = async (req, res) => {
    const { identifier, password } = req.body;

    try {
        const { user } = await findUserByEmailOrUsername(identifier);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        // Generate JWT Token with 'id' to match what authMiddleware expects
        const token = jwt.sign(
            { id: user._id }, // Change to 'id' instead of 'userId'
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        res.json({
            message: "Login successful.",
            token, // Send the token to the client
            user: {
                id: user._id, // Send user info without the password
                email: user.email,
                username: user.username // Include additional required user fields
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred during the login process." });
    }
};




// exports.verifyOtpForLogin = async (req, res) => {
//     const { otp } = req.body;
//     const tempLogin = await TempLogin.findOne({ otp: otp });
//     if (!tempLogin) {
//         return res.status(400).json({ message: "OTP is incorrect or has expired." });
//     }

//     const user = await User.findById(tempLogin.userId);
//     if (!user) {
//         return res.status(404).json({ message: "User not found." });
//     }

//     // Generate tokens, log the user in, and clean up TempLogin
//     const accessToken = generateAccessToken(user._id);
//     const refreshToken = generateRefreshToken(user._id);
//     await TempLogin.findByIdAndDelete(tempLogin._id);

//     res.json({
//         message: "OTP verified. Login successful.",
//         accessToken,
//         refreshToken,
//         user: {
//             id: user._id,
//             email: user.email,
//             // Include other user details as needed
//         }
//     });
// };


// exports.resendOtp = async (req, res) => {
//     const { email } = req.body;

//     try {
//         const user = await User.findOne({ email });
//         if (!user) return res.status(404).json({ message: "User not found." });

//         // Generate a new OTP, replace the old one in TempLogin, and send it
//         const newOtp = generateOtp();
//         await TempLogin.findOneAndUpdate({ email }, { otp: newOtp }, { new: true });
//         await sendOtpEmail(email, newOtp);

//         res.json({ message: "OTP has been resent to your email." });
//     } catch (error) {
//         console.error("Resend OTP Error:", error);
//         res.status(500).json({ message: "Failed to resend OTP." });
//     }
// };

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
