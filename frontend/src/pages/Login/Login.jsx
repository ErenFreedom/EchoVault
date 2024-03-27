import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // Temporarily commented out
import './Login.css'; // Your CSS file path for styling

const Login = () => {
  // let navigate = useNavigate(); // Temporarily commented out

  // States to store user input
  const [loginField, setLoginField] = useState('');
  const [password, setPassword] = useState('');

  // Function to handle form submission
  const handleLogin = (e) => {
    e.preventDefault();
    // Perform login logic here, validate etc.
    console.log(loginField, password);
    // Placeholder for when navigation is implemented
    // navigate('/dashboard'); // Uncomment this line when ready to navigate
  };

  return (
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
  );
};

export default Login;
