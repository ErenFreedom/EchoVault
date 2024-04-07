// DBoardHeader.jsx
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import './DBoardHeader.css';

const DBoardHeader = ({ isPremium, isGuest, linkedToUsername }) => {
    const navigate = useNavigate();
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
    const handleLogout = () => {
        // Remove the token
        sessionStorage.removeItem('token'); // Or localStorage.removeItem('token') if you're using localStorage

        // Navigate to landing page
        navigate('/');
    };
    const handleDeleteAccount = async () => {
        // Prompt user to enter their current password
        const currentPassword = prompt('Please enter your current password to confirm account deletion:');
        if (!currentPassword) {
            alert('You need to enter your password to delete your account.');
            return;
        }
    
        // Confirmation dialog
        const isConfirmed = window.confirm("Are you sure you want to delete your account? All your information will be lost. Consider saving all your documents before deleting.");
        if (!isConfirmed) {
            // User decided to cancel
            return;
        }
    
        // If confirmed, proceed to call the API endpoint to delete the account
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/delete-account`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`, // Assuming token is stored in sessionStorage
                },
                body: JSON.stringify({ currentPassword }),
            });
    
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to delete account");
            alert('Account deleted successfully.');
    
            // Perform additional cleanup here, like navigating to the landing page and clearing session
            sessionStorage.removeItem('token'); // Clear user session to ensure they are logged out
            navigate('/'); // Navigate to the landing page
        } catch (error) {
            alert(error.message);
        }
    };
    

    const handleDropdownAction = (action) => {
        console.log(`Action selected: ${action}`);
        // Call handleLogout if logout action is selected
        if (action === 'logout') {
            handleLogout();
        }
        else if (action === 'delete-account') {
            handleDeleteAccount(); // This line ensures handleDeleteAccount is called
        }
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
                        <button onClick={() => navigate('/payment')} className="upgrade-btn">Upgrade To Premium</button>
                    )}
                    <div className={`dropdown ${accountDropdownOpen ? "show" : ""}`}>
                        <button className="dropbtn" onClick={toggleAccountDropdown}>
                            Your Account
                        </button>
                        {accountDropdownOpen && (
                            <div className="dropdown-content">
                                <Link to="/profile" className="dropdown-item dropdown-link">My Profile</Link>
                                <Link to="/change-password" className="dropdown-item dropdown-link">Change Password</Link> {/* Updated this line */}
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
