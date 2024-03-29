import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import './SignUp.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '', // ensure this is a string for controlled component
    gender: 'male', // Default value
    username: '',
    email: '',
    password: '',
    recoveryEmail: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'age') {
      // If the age is outside the range, don't update the state
      const ageValue = Math.max(1, Math.min(200, Number(value)));
      setFormData({ ...formData, age: ageValue.toString() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Submit form logic here, make sure to hash password before sending
    // Your form submission handling logic...
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
            <option value="other">Other</option>
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
          <Link to="/register-guest" className="guest-register-link">Register as guest user</Link>
        </form>
      </div>
    </div>
  );
};


export default SignUp;
