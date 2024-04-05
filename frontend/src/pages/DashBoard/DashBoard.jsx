import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashBoard.css';
import DBoardHeader from '../../components/Header/DBoardHeader';
import DashBoardContent from '../../components/DashBoardContent/DashBoardContent';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.add('dashboard-page');

        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem('token'); // Adjusted to 'token' for consistency
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/data`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const data = await response.json();
                setUserData(data);
            } catch (error) {
                console.error(error.message);
                
            }
        };

        fetchData();

        return () => {
            document.body.classList.remove('dashboard-page');
        };
    }, [navigate]);

    if (!userData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard">
            <DBoardHeader />
            <DashBoardContent userName={userData.name} />
        </div>
    );
};

export default Dashboard;
