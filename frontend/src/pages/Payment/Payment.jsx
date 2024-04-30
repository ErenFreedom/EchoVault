import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Payment.css';

const Payment = ({ onUpgradeToPremium }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); 

  // In Payment.jsx
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/upgrade-to-premium`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await response.json();
            if (response.ok) {
                alert('Upgrade to Premium successful.');
                navigate('/premium-dashboard');
            } else {
                throw new Error(data.message || "Upgrade failed");
            }
        } else {
            const textData = await response.text();
            throw new Error(textData || "An unexpected response was received");
        }
    } catch (error) {
        console.error("Error during the fetch operation:", error);
        alert(error.message);
    }
};

  
  

  return (
    <div className="payment-container">
      <h1>Upgrade to Premium</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            type="text"
            id="price"
            value="$15"
            readOnly
            className="form-control"
          />
        </div>
        <div className="form-group">
          <button type="submit" className="payment-btn">Proceed with Payment</button>
        </div>
      </form>
    </div>
  );
};

export default Payment;
