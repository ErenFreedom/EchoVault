import React from 'react';
import './ProfilePage.css';

const ProfilePage = () => {
    // Placeholder user data
    const placeholderUserData = {
        firstName: 'N/A',
        lastName: 'N/A',
        age: 'N/A',
        gender: 'N/A',
        username: 'N/A',
        email: 'N/A',
        recovery_email: 'N/A'
    };

    // Instead of destructuring from props, we're using the placeholder data directly
    const { firstName, lastName, age, gender, username, email, recovery_email } = placeholderUserData;

    return (
        <div className="profile-page">
            <h1>Profile Information</h1>
            <div className="profile-info">
                <label>First Name:</label>
                <span>{firstName}</span>

                <label>Last Name:</label>
                <span>{lastName}</span>

                <label>Age:</label>
                <span>{age}</span>

                <label>Gender:</label>
                <span>{gender}</span>

                <label>Username:</label>
                <span>{username}</span>

                <label>Email:</label>
                <span>{email}</span>

                <label>Recovery Email:</label>
                <span>{recovery_email}</span>
            </div>
        </div>
    );
};

export default ProfilePage;
