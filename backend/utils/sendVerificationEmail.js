const nodemailer = require('nodemailer');
require('dotenv').config();

const sendVerificationEmail = async (email, verificationLink) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: `"Your Sender Name" <${process.env.EMAIL_USERNAME}>`,
        to: email,
        subject: 'Verify Your Email Address',
        html: `<p>Click the following link to verify your email address:</p><p><a href="${verificationLink}">Verify Email</a></p>`,
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log('Verification email sent:', result);
        return true;
    } catch (error) {
        console.error('Error sending verification email:', error);
        return false;
    }
};

module.exports = { sendVerificationEmail };
