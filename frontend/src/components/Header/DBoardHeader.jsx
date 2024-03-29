// DBoardHeader.jsx
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import './DBoardHeader.css';

const DBoardHeader = ({ isPremium }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    // Dummy function to handle dropdown action - replace with your actual function
    const handleDropdownAction = (action) => {
        console.log(action);
        // Perform the action here
    };

    return (
        <>
            <Helmet>
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
                />
            </Helmet>
            <header className="dboard-header">
                <div className="logo-container">
                    <img src="/images/Icon2.png" alt="EchoVault Logo" className="header-icon" />
                    EchoVault
                </div>
                <nav className="nav-links">
                    <div className="notification-bell">
                        <i className="fas fa-bell"></i>
                    </div>
                    <a href="/home">Home</a>
                    {isPremium ? (
                        <div className="dropdown">
                            <button className="dropbtn" onClick={toggleDropdown}>
                                Guest Accounts Linked
                            </button>
                            {dropdownOpen && (
                                <div className="dropdown-content">
                                    {/* Use buttons instead of anchor tags for actions */}
                                    <button onClick={() => handleDropdownAction('guest1')}>Guest Account 1</button>
                                    <button onClick={() => handleDropdownAction('guest2')}>Guest Account 2</button>
                                    {/* ... more dropdown items ... */}
                                </div>
                            )}
                        </div>
                    ) : (
                        <a href="/upgrade">Upgrade To Premium</a>
                    )}
                    <div className="dropdown">
                        <button className="dropbtn" onClick={toggleDropdown}>
                            Your Account
                        </button>
                        {dropdownOpen && (
                            <div className="dropdown-content">
                                <a href="/profile">My Profile</a>
                                <a href="/change-password">Change Password</a>
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
