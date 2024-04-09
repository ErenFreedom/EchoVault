import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DBoardHeader from '../../components/Header/DBoardHeader'; 
import DashBoardContent from '../../components/DashBoardContent/DashBoardContent';
import './GuestDashBoard.css'; // Ensure you have this CSS

const GuestDashBoard = ({ user }) => {
    const navigate = useNavigate();
    const [dashboardPermissions, setDashboardPermissions] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Example check to see if the user is a guest and has a linked premium user
        if (user.isGuest && user.linkedToUsername) {
            // Ideally, fetch dashboard permissions from the backend using the linkedToUsername
            // For this example, using a static permission setup
            // Replace this part with your actual API call
            fetch(`${process.env.REACT_APP_BACKEND_URL}/api/permissions/check-permissions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                },
                // You might need to adjust the query parameters based on your backend API
                // body: JSON.stringify({ dummyUserId: user.id, requiredPermission: "view" }), 
            })
            .then(response => response.json())
            .then(data => {
                setDashboardPermissions({
                    canView: data.canView,
                    canEdit: data.canEdit, // Assume these values are returned by your API
                    // Add more permissions as needed
                });
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching permissions:', error);
                navigate('/login'); // Redirect or handle errors as appropriate
            });
        } else {
            // If not a guest or no linked premium user, handle accordingly
            navigate('/login'); // Adjust as needed
        }
    }, [user, navigate]);

    if (loading) {
        return <div>Loading dashboard...</div>; // Or any loading indicator you prefer
    }

    return (
        <div className="guest-dashboard">
            <DBoardHeader isGuest={true} linkedToUsername={user.linkedToUsername} />
            <DashBoardContent permissions={dashboardPermissions} />
        </div>
    );
};

export default GuestDashBoard;
