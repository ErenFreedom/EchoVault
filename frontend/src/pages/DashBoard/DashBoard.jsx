import React, { useEffect, useState } from 'react';
import './DashBoard.css';
import DBoardHeader from '../../components/Header/DBoardHeader';
import DashBoardContent from '../../components/DashBoardContent/DashBoardContent';

const Dashboard = () => {
    const [userData, setUserData] = useState(null); // State to hold user data

    useEffect(() => {
        document.body.classList.add('dashboard-page');

        // Fetch user data
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/data`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
                        // Additional headers...
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const data = await response.json();
                setUserData(data); // Store the fetched data in state
            } catch (error) {
                console.error(error.message);
                // Handle errors (e.g., redirect to login page)
            }
        };

        fetchData();

        return () => {
            document.body.classList.remove('dashboard-page');
        };
    }, []);

    // If userData is not yet fetched, you can return loading indicator, etc.
    if (!userData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard">
            <DBoardHeader />
            {/* Pass the fetched userData to DashBoardContent or use it here */}
            <DashBoardContent userName={userData.name} />
        </div>
    );
};

export default Dashboard;
