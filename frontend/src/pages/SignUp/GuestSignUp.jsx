import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GuestSignUp.css';

const GuestSignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: 'male',
    username: '',
    email: '',
    password: '',
    linkedPremiumUsername: '', // Corrected to match the backend's field name
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/guest-users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message and navigate to login page
        alert('Registration successful. You can now log in.');
        navigate('/login'); // Directly navigate to the login page
      } else {
        alert(data.message); // Show error message if registration wasn't successful
      }
    } catch (error) {
      alert('Cannot connect to the server');
    }
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
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          name="linkedPremiumUsername"
          placeholder="Linked Premium Username"
          value={formData.linkedPremiumUsername}
          onChange={handleChange}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default GuestSignUp;
