const nodemailer = require('nodemailer');
const { google } = require('google-auth-library');

// Client ID and Client Secret from the downloaded JSON
const CLIENT_ID = 'your-client-id';
const CLIENT_SECRET = 'your-client-secret';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = 'your-refresh-token-obtained-from-oauth-playground';

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const generateOtp = () => {
    // Generate a 6 digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp;
};

const sendOtpEmail = async (email, otp) => {
    try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'your-email@gmail.com',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken.token,
            },
        });

        const mailOptions = {
            from: 'YOUR NAME <your-email@gmail.com>',
            to: email,
            subject: 'Your OTP',
            text: `Your OTP is: ${otp}`,
            html: `<p>Your OTP is: <b>${otp}</b></p>`, // You can style it to look better
        };

        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error) {
        console.error('Error sending OTP email', error);
        throw new Error('Error sending OTP email');
    }
};

module.exports = { generateOtp, sendOtpEmail };
