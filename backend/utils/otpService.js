const nodemailer = require('nodemailer');
require('dotenv').config();

const generateOtp = () => {
    // Generate a 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp;
};

const sendOtpEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: `"Eren Jaeger" <${process.env.EMAIL_USERNAME}>`, 
        to: email,
        subject: 'Your OTP',
        text: `Your OTP is: ${otp}`,
        html: `<p>Your OTP is: <b>${otp}</b></p>`, 
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent:', result);
        return true;
    } catch (error) {
        console.error('Error sending OTP email', error);
        return false;
    }
};

module.exports = { generateOtp, sendOtpEmail };
