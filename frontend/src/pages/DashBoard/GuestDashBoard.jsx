import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DBoardHeader from '../../components/Header/DBoardHeader'; 
import DashBoardContent from '../../components/DashBoardContent/DashBoardContent';
import './GuestDashBoard.css'; 

const GuestDashBoard = ({ user }) => {
    const navigate = useNavigate();
    const [dashboardPermissions, setDashboardPermissions] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user.isGuest && user.linkedToUsername) {
            
            fetch(`${process.env.REACT_APP_BACKEND_URL}/api/permissions/check-permissions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                },
               
            })
            .then(response => response.json())
            .then(data => {
                setDashboardPermissions({
                    canView: data.canView,
                    canEdit: data.canEdit, 
                });
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching permissions:', error);
                navigate('/login'); 
            });
        } else {
            navigate('/login'); 
        }
    }, [user, navigate]);

    if (loading) {
        return <div>Loading dashboard...</div>; 
    }

    return (
        <div className="guest-dashboard">
            <DBoardHeader isGuest={true} linkedToUsername={user.linkedToUsername} />
            <DashBoardContent permissions={dashboardPermissions} />
        </div>
    );
};

export default GuestDashBoard;
