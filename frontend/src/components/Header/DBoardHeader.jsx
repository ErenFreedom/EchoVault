import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

import './DBoardHeader.css';

const DBoardHeader = ({ isPremium }) => {
    const navigate = useNavigate();
    const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
    const [themeDropdownOpen, setThemeDropdownOpen] = useState(false); // For toggling theme dropdown
    const { theme, setTheme } = useTheme();

    const toggleAccountDropdown = () => {
        setAccountDropdownOpen(!accountDropdownOpen);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        navigate('/');
    };

    const toggleThemeDropdown = () => {
        setThemeDropdownOpen(!themeDropdownOpen);
    };

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
    };

    

    const handleDeleteAccount = async () => {
        const currentPassword = prompt('Please enter your current password to confirm account deletion:');
        if (!currentPassword) {
            alert('You need to enter your password to delete your account.');
            return;
        }

        const isConfirmed = window.confirm("Are you sure you want to delete your account? All your information will be lost.");
        if (!isConfirmed) {
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/delete-account`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                },
                body: JSON.stringify({ currentPassword }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to delete account");
            alert('Account deleted successfully.');
            sessionStorage.removeItem('token');
            navigate('/');
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDropdownAction = (action) => {
        if (action === 'logout') {
            handleLogout();
        } else if (action === 'delete-account') {
            handleDeleteAccount();
        }
    };

    

    return (
        <>
            <Helmet>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"/>
            </Helmet>
            <header className="dboard-header">
                <div className="logo-container">
                    <img src="/images/Icon2.png" alt="EchoVault Logo" className="header-icon"/>
                    EchoVault
                </div>
                <nav className="nav-links">
                   
                    <a href="/home">Home</a>
                    {isPremium && (
                        <div className={`dropdown ${themeDropdownOpen ? "show" : ""}`}>
                            <button onClick={toggleThemeDropdown} className="dropbtn">Theme</button>
                            {themeDropdownOpen && (
                                <div className="dropdown-content">
                                    <button onClick={() => handleThemeChange('white')} className={theme === 'white' ? 'active' : ''}>White {theme === 'white' && <i className="fas fa-check"></i>}</button>
                                    <button onClick={() => handleThemeChange('dark')} className={theme === 'dark' ? 'active' : ''}>Dark {theme === 'dark' && <i className="fas fa-check"></i>}</button>
                                </div>
                            )}
                        </div>
                   )}
                    {!isPremium && <button onClick={() => navigate('/payment')} className="upgrade-btn">Upgrade To Premium</button>}
                    <button onClick={() => navigate('/feedback')} className="rate-us-btn">Rate Us</button>
                    <div className={`dropdown ${accountDropdownOpen ? "show" : ""}`}>
                        <button className="dropbtn" onClick={toggleAccountDropdown}>
                            Your Account
                        </button>
                        {accountDropdownOpen && (
                            <div className="dropdown-content">
                                <Link to="/profile" className="dropdown-item dropdown-link">My Profile</Link>
                                <Link to="/change-password" className="dropdown-item dropdown-link">Change Password</Link>
                                <button onClick={() => handleDropdownAction('logout')}>Logout</button>
                                <button onClick={() => handleDropdownAction('delete-account')}>Delete Account</button>
                            </div>
                        )}
                    </div>
                </nav>
            </header>
        </>
    );
};

export default DBoardHeader;