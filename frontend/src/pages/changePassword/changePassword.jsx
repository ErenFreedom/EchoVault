import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './changePassword.css'; 

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('New password and confirm password do not match.');
            return;
        }

        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/change-password`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`, 
            },
            body: JSON.stringify({ currentPassword, newPassword }),
        });

        const data = await response.json();
        if (response.ok) {
            alert('Password changed successfully');
            navigate('/'); 
        } else {
            alert(data.message || 'An error occurred while changing the password.');
        }
    };

    return (
        <div className="change-password-container">
            <h2>Change Password</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Current Password</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                <button type="submit" className="submit-btn">Change Password</button>
            </form>
        </div>
    );
};

export default ChangePassword;
