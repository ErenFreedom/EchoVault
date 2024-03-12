const nodemailer = require('nodemailer');

// Function to generate a 6-digit OTP
exports.generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit random number
    return otp.toString();
};

// Function to send OTP via email
exports.sendOtpEmail = async (email, otp) => {
    try {
        // Create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.example.com", // Your SMTP host
            port: 587, // SMTP port
            secure: false, // true for 465, false for other ports
            auth: {
                user: "your_email@example.com", // Your email
                pass: "your_email_password", // Your email password
            },
        });

        // Send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"Your Name or Company" <your_email@example.com>', // Sender address
            to: email, // List of receivers
            subject: "Your OTP", // Subject line
            text: `Your OTP is: ${otp}`, // Plain text body
            html: `<b>Your OTP is: ${otp}</b>`, // HTML body
        });

        console.log("Message sent: %s", info.messageId);
        return true; // Indicate success
    } catch (error) {
        console.error("Error sending OTP email:", error);
        return false; // Indicate failure
    }
};
