import React, { useState } from 'react';
import './SignUp.css'; // Make sure the CSS file is in the same directory

const SignUp = () => {
  // State to store input values
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: 'male', // default to 'male' or you can leave it empty to enforce selection
    username: '',
    email: '',
    password: '',
    recovery_email: ''
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    
    // Send data to the backend using fetch or another HTTP library
    const response = await fetch('http://localhost:3001/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
      credentials: 'include', // if you're handling cookies
    });

    const data = await response.json();
    if (response.ok) {
      console.log('Registration successful', data);
      // Handle success
    } else {
      console.error('Registration failed', data);
      // Handle errors
    }
  };

  return (
    <div className="signup-container">
      <h1>Welcome to EchoVault</h1>
      <h2>Sign up</h2>
      <form className="signup-form" onSubmit={handleSubmit}>
        <label>
          First Name:
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="John"
            required
          />
        </label>
        <label>
          Last Name:
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Doe"
            required
          />
        </label>
        <label>
          Age:
          <input
            name="age"
            value={formData.age}
            onChange={handleChange}
            type="number"
            placeholder="30"
            required
          />
        </label>
        <div className="gender-select">
          <label>
            Male
            <input
              type="radio"
              name="gender"
              value="male"
              checked={formData.gender === 'male'}
              onChange={handleChange}
            />
          </label>
          <label>
            Female
            <input
              type="radio"
              name="gender"
              value="female"
              checked={formData.gender === 'female'}
              onChange={handleChange}
            />
          </label>
        </div>
        <label>
          Username:
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="john_doe"
            required
          />
        </label>
        <label>
          E-Mail:
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            placeholder="freedomyeager12@gmail.com"
            required
          />
        </label>
        <label>
          Password:
          <input
            name="password"
            value={formData.password}
            onChange={handleChange}
            type="password"
            placeholder="Your Password"
            required
          />
        </label>
        <label>
          Recovery Email:
          <input
            name="recovery_email"
            value={formData.recovery_email}
            onChange={handleChange}
            type="email"
            placeholder="recovery@example.com"
            required
          />
        </label>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
