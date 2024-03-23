import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css'; // Make sure to create Header.css in the same folder

const Header = () => (
  <nav className="header">
    <h1>EchoVault</h1>
    <div>
      <Link to="/login" className="nav-button">Log In</Link>
      <Link to="/register" className="nav-button">Register</Link>
    </div>
  </nav>
);

export default Header;
