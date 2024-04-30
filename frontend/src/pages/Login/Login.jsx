import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    let navigate = useNavigate();

    const [loginField, setLoginField] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        const loginEndpoint = `${process.env.REACT_APP_BACKEND_URL}/api/auth/login`;

        try {
            const response = await fetch(loginEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: loginField, password }),
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem('token', data.token);

                if (data.user.isPremium) {
                    console.log("Redirecting to Premium Dashboard");
                    navigate('/premium-dashboard'); 
                } else {
                    console.log("Redirecting to Standard Dashboard");
                    navigate('/dashboard'); // Redirect to Standard Dashboard
                }
            } else {
                alert(data.message); 
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Cannot connect to the server');
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