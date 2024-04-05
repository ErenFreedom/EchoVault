import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './otpPage.css'; // Make sure the path to your CSS is correct

const OtpPage = () => {
    const navigate = useNavigate();

    // Retrieve the email from localStorage instead of location.state
    const email = localStorage.getItem('emailForVerification');
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(60); // Timer for OTP expiration

    useEffect(() => {
        // Timer countdown for UX
        const interval = setInterval(() => {
            setTimer((prevTimer) => prevTimer > 0 ? prevTimer - 1 : 0);
        }, 1000);

        // Redirect user if email is not set (i.e., direct navigation to OTP page without email)
        if (!email) {
            alert("No email found for verification. Please register first.");
            navigate('/signup'); // Adjust the route as needed
        }

        return () => clearInterval(interval);
    }, [navigate, email]);

    const resendOtp = async () => {
        setTimer(60); // Reset timer for new OTP
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to resend OTP');
            }
            alert('OTP has been resent. Please check your email.');
        } catch (error) {
            console.error('Error resending OTP:', error);
            alert('Error resending OTP');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }), // Send the email and OTP directly
            });
    
            if (response.headers.get('content-type')?.includes('application/json')) {
                const data = await response.json();
                if (response.ok) {
                    // Navigate to dashboard or next step after successful OTP verification
                    navigate('/dashboard'); // Adjust as per your route setup
                    localStorage.removeItem('emailForVerification'); // Clean up
                } else {
                    throw new Error(data.message || 'Error verifying OTP');
                }
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Non-JSON response received');
            }
        } catch (error) {
            alert(error.message);
        }
    };
    
    return (
        <div className="otp-page">
            <form onSubmit={handleSubmit} className="otp-form">
                <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                />
                <button type="submit" disabled={timer <= 0}>Verify OTP</button>
            </form>
            {timer > 0 ? (
                <p>Resend OTP in {timer} seconds</p>
            ) : (
                <button onClick={resendOtp}>Resend OTP</button>
            )}
            {timer <= 0 && <p>OTP expired. Please resend OTP.</p>}
        </div>
    );
};

export default OtpPage;