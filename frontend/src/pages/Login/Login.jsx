import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Make sure the CSS path is correct

const Login = () => {
    let navigate = useNavigate(); // This is used for navigation after login or OTP verification

    const [loginField, setLoginField] = useState('');
    const [password, setPassword] = useState('');
    // You might also want to track whether the server requests an OTP after login
    const [requiresOtp, setRequiresOtp] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        
        const loginEndpoint = `${process.env.REACT_APP_BACKEND_URL}/api/auth/login`;
        
        try {
            const response = await fetch(loginEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ identifier: loginField, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Here, based on the response, decide if navigating to /verify-otp or directly to /dashboard
                if (data.requiresOtpVerification) {
                    // If your backend indicates that OTP verification is required
                    setRequiresOtp(true);
                    sessionStorage.setItem('accessToken', data.accessToken); // Optionally store accessToken if required for OTP verification
                    navigate('/verify-otp'); // Navigate to OTP verification page
                } else {
                    // If no OTP verification is required, navigate directly to the dashboard
                    sessionStorage.setItem('accessToken', data.accessToken); // Store accessToken securely
                    navigate('/dashboard'); // Navigate to the dashboard
                }
            } else {
                // Server responded with an error
                alert(data.message); // Show error message
            }
        } catch (error) {
            // Network error or other issue
            alert('Cannot connect to the server'); // Show network/connection error
        }
    };

    return (
        <div className="login-background">
            <div className="login-container">
                <h1>Welcome to EchoVault</h1>
                <form className="login-form" onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username or Email"
                        value={loginField}
                        onChange={(e) => setLoginField(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="login-button">Login</button>
                </form>
                <div className="signup-link">
                    Don't have an account? <a href="/signup">Sign up for EchoVault</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
