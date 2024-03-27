import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => (
  <header className="header">
    <div className="header-container">
      <div className="brand-container">
        <img src="/images/Icon2.png" alt="EchoVault Logo" className="header-icon" />
        <h1>EchoVault</h1>
      </div>
      <div className="header-buttons">
        <Link to="/login" className="nav-button">Log In</Link>
        <Link to="/signup" className="nav-button register-button">SignUp</Link> {/* Changed from /register to /signup */}
      </div>
    </div>
  </header>
);

export default Header;
