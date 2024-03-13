const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

// Client ID and Client Secret from the downloaded JSON
const CLIENT_ID = '1050320424575-57up01df7t37uu9n2ksnn5mpoc7eb535.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04lzlZAuHjRpHCgYIARAAGAQSNwF-L9IrxgPMSS9aiP2a9pV_rW1cUwUSyQgNWTc_IfS_612e0n3BcWqWuuKORLOLt44oD-Jjop4';

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const generateOtp = () => {
    // Generate a 6-digit numeric OTP
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
                user: 'freedomyeager12@gmail.com', // This should be the Gmail address associated with the credentials
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken.token,
            },
        });

        const mailOptions = {
            from: 'Eren Jaeger <freedomyeager12@gmail.com>', // Replace with your sender name and email
            to: email,
            subject: 'Your OTP',
            text: `Your OTP is: ${otp}`,
            html: `<p>Your OTP is: <b>${otp}</b></p>`, // You can style this HTML email as desired
        };

        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error) {
        console.error('Error sending OTP email', error);
        throw new Error('Error sending OTP email');
    }
};

module.exports = { generateOtp, sendOtpEmail };
