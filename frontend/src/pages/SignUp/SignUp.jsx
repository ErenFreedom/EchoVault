import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './SignUp.css';


const SignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '', 
    gender: 'male', 
    username: '',
    email: '',
    password: '',
    recoveryEmail: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      recovery_email: formData.recoveryEmail, 
    };
    delete payload.recoveryEmail; 
  
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), 
      });
  
      const data = await response.json();
  
      if (response.ok) {
        
        localStorage.setItem('emailForVerification', formData.email);
        alert('Registration in process. Please verify your account with the OTP sent to your email.');
        navigate('/otp-verification'); 
      } else {
        console.error('Registration failed:', data.message);
        alert(data.message);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Cannot connect to the server');
    }
  };
  
  

  return (
    <div className="page-background"> {/* This div applies the full-page green background */}
      <div className="signup-container"> {/* This div is the centered white form container */}
        <h1>Welcome to EchoVault</h1>
        <h2>Sign up</h2>
        <form className="signup-form" onSubmit={handleSubmit}>
          <input
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <input
            name="age"
            type="number"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            min="1"
            max="200"
            required
          />
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="others">Others</option>
          </select>
          <input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="E-Mail"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            name="recoveryEmail"
            type="email"
            placeholder="Recovery Email"
            value={formData.recoveryEmail}
            onChange={handleChange}
            required
          />
          <button type="submit" className="signup-button">Sign Up</button>
          
        </form>
      </div>
    </div>
  );
};


export default SignUp;
