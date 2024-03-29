import React, { useEffect } from 'react';
import './DashBoard.css';
import DBoardHeader from '../../components/Header/DBoardHeader';
import DashBoardContent from '../../components/DashBoardContent/DashBoardContent'; // Make sure the path is correct

const Dashboard = () => {
    useEffect(() => {
        // Add the 'dashboard-page' class to the body when the component mounts
        document.body.classList.add('dashboard-page');
        
        // Remove the 'dashboard-page' class when the component unmounts
        return () => {
            document.body.classList.remove('dashboard-page');
        };
    }, []);

    // Assume 'Rhea' is the logged-in user's name
    const userName = 'Rhea';

    return (
        <div className="dashboard">
            <DBoardHeader />
            {/* Pass the userName as a prop to DashBoardContent */}
            <DashBoardContent userName={userName} />
        </div>
    );
};

export default Dashboard;
