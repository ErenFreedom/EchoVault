const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USERNAME, 
        pass: process.env.EMAIL_PASSWORD 
    }
});

// Send an email
const sendEmail = async (options) => {
    try {
        let mailOptions = {
            from: process.env.EMAIL_USERNAME, 
            to: options.to, 
            subject: options.subject, 
            text: options.text, 
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email: ', error);
        throw error; 
    }
};

module.exports = {
    sendEmail
};
