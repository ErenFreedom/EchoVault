// DBoardHeader.jsx
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import './DBoardHeader.css';

const DBoardHeader = ({ isPremium, isGuest, linkedToUsername }) => {
    const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
    const [guestDropdownOpen, setGuestDropdownOpen] = useState(false);

    // Toggle account dropdown
    const toggleAccountDropdown = () => {
        setAccountDropdownOpen(!accountDropdownOpen);
        if (guestDropdownOpen) {
            setGuestDropdownOpen(false);
        }
    };

    // Toggle guest accounts dropdown
    const toggleGuestDropdown = () => {
        setGuestDropdownOpen(!guestDropdownOpen);
        if (accountDropdownOpen) {
            setAccountDropdownOpen(false);
        }
    };

    const handleDropdownAction = (action) => {
        console.log(`Action selected: ${action}`);
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
                    {isGuest ? (
                       <div className="dropdown">
                          <button className="dropbtn" onClick={toggleGuestDropdown}>
                          Linked To {linkedToUsername}
                          <i className="fas fa-caret-down"></i> {/* You can add a down arrow icon */}
                        </button>
                        {guestDropdownOpen && (
                    <div className="dropdown-content">
                             {/* Dropdown items will go here. For now, it's just a placeholder */}
                    </div>
                                 )}
                    </div>
                    ) : isPremium ? (
                        <div className={`dropdown ${guestDropdownOpen ? "show" : ""}`}>
                            <button className="dropbtn" onClick={toggleGuestDropdown}>
                                Guest Accounts Linked
                            </button>
                            {guestDropdownOpen && (
                                <div className="dropdown-content">
                                    <button onClick={() => handleDropdownAction('guest1')}>Guest Account 1</button>
                                    <button onClick={() => handleDropdownAction('guest2')}>Guest Account 2</button>
                                    {/* ... more dropdown items ... */}
                                </div>
                            )}
                        </div>
                    ) : (
                        <a href="/upgrade">Upgrade To Premium</a>
                    )}
                    <div className={`dropdown ${accountDropdownOpen ? "show" : ""}`}>
                        <button className="dropbtn" onClick={toggleAccountDropdown}>
                            Your Account
                        </button>
                        {accountDropdownOpen && (
                            <div className="dropdown-content">
                                <Link to="/profile" className="dropdown-item dropdown-link">My Profile</Link>
                                <button onClick={() => handleDropdownAction('change-password')}>Change Password</button>
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
