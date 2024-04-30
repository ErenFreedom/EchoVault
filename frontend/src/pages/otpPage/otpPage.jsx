import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './otpPage.css'; 

const OtpPage = () => {
    const navigate = useNavigate();

    const email = localStorage.getItem('emailForVerification');
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(60); 

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prevTimer) => prevTimer > 0 ? prevTimer - 1 : 0);
        }, 1000);

       
        if (!email) {
            alert("No email found for verification. Please register first.");
            navigate('/signup'); 
        }

        return () => clearInterval(interval);
    }, [navigate, email]);

    const resendOtp = async () => {
        setTimer(60); 
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
                    toast.success('Successfully Registered', {
                        position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                    // Navigate to dashboard or next step after successful OTP verification
                    navigate('/login'); 
                    localStorage.removeItem('emailForVerification'); 
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
        <>
            <ToastContainer position="top-center" autoClose={5000} />
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
        </>
    );
    
};

export default OtpPage;