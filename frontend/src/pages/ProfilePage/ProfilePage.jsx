import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
    // Placeholder user data - replace with actual user data retrieval logic
    const navigate = useNavigate();
    // Initialize state
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        age: '',
        gender: '',
        username: '',
        email: '', // Email is view-only
        recovery_email: ''
    });
    const [currentPassword, setCurrentPassword] = useState('');
    const [isFetching, setIsFetching] = useState(true); // State to track data fetching status

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/data`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`, // or localStorage
                    },
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Failed to fetch profile data");
                setUserData(data); // Set fetched data into state
            } catch (error) {
                alert(error.message);
                navigate('/login'); // Redirect to login page if unauthorized
            } finally {
                setIsFetching(false); // Set fetching status to false once data is fetched or an error occurs
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const updates = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            age: userData.age,
            gender: userData.gender,
            username: userData.username,
            recovery_email: userData.recovery_email
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/update-info`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`, // or localStorage
                },
                body: JSON.stringify({ currentPassword, updates }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to update profile");
            alert('Profile updated successfully');
            setUserData({ ...userData, ...updates }); // Update local state with the new data
        } catch (error) {
            alert(error.message);
        }
    };

    // If data is still being fetched, you can return a loading indicator
    if (isFetching) {
        return <div>Loading...</div>;
    }

    return (
        <div className="profile-page">
            <h1>Profile Information</h1>
            <form onSubmit={handleSubmit} className="profile-form">
                <div className="profile-info">
                    <label>First Name:</label>
                    <input name="firstName" value={userData.firstName} onChange={handleChange} />
                    
                    <label>Last Name:</label>
                    <input name="lastName" value={userData.lastName} onChange={handleChange} />
                    
                    <label>Age:</label>
                    <input name="age" type="number" value={userData.age} onChange={handleChange} />
                    
                    <label>Gender:</label>
                    <select name="gender" value={userData.gender} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                    
                    <label>Username:</label>
                    <input name="username" value={userData.username} onChange={handleChange} />

                    <label>Email:</label>
                    <span>{userData.email}</span> {/* Email is view-only */}

                    <label>Recovery Email:</label>
                    <input name="recovery_email" value={userData.recovery_email} onChange={handleChange} />
                </div>
                
                <label>Current Password (for verification):</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />

                <button type="submit">Update Profile</button>
            </form>
        </div>
    );
};

export default ProfilePage;
