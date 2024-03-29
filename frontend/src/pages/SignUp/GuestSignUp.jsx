import React, { useState } from 'react';
import './GuestSignUp.css';

const GuestSignUp = ({ decoded }) => {
  // Ensure decoded object is defined, if not, initialize an empty object
  const decodedData = decoded || {};

  const [formData, setFormData] = useState({
    firstName: decodedData.firstName || '',
    lastName: decodedData.lastName || '',
    age: decodedData.age || '',
    gender: decodedData.gender || 'male',
    username: decodedData.username || '',
    email: decodedData.email || '',
    recoveryEmail: decodedData.recoveryEmail || '',
    phoneNumber: decodedData.phoneNumber || '',
    password: decodedData.password || '',
    linkedTo: decodedData.linkedPremiumUserId || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here, include your logic for handling the guest sign up submission
    // Make sure to properly handle and secure the password and other sensitive information
  };

  return (
    <div className="signup-container">
      <h1>Welcome to EchoVault</h1>
      <h2>Sign up as Guest User</h2>
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
          name="recoveryEmail"
          type="email"
          placeholder="Recovery Email"
          value={formData.recoveryEmail}
          onChange={handleChange}
          required
        />
        <input
          name="phoneNumber"
          type="tel"
          placeholder="Phone Number"
          value={formData.phoneNumber}
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
        name="linkedTo"
        placeholder="Linked Premium Username"
        value={formData.linkedTo}
        onChange={handleChange}
        required
  />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default GuestSignUp;
