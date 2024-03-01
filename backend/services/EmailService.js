const nodemailer = require('nodemailer');

// Create a transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service provider
    auth: {
        user: process.env.EMAIL_USERNAME, // Your email address
        pass: process.env.EMAIL_PASSWORD // Your email password
    }
});

// Send an email
const sendEmail = async (options) => {
    try {
        let mailOptions = {
            from: process.env.EMAIL_USERNAME, // Sender address
            to: options.to, // List of receivers
            subject: options.subject, // Subject line
            text: options.text, // Plain text body
            // html: options.html // html body (if you want to send HTML emails)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email: ', error);
        throw error; // Rethrow the error for the caller to handle
    }
};

module.exports = {
    sendEmail
};
