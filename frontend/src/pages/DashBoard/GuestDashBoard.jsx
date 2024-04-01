import React from 'react';
import DBoardHeader from '../../components/Header/DBoardHeader'; 
import DashBoardContent from '../../components/DashBoardContent/DashBoardContent';
import './GuestDashBoard.css'; // Make sure to create this CSS file

const GuestDashBoard = ({ userName }) => {
    return (
        <div className="guest-dashboard">
            {/* Pass isGuest and linkedToUsername props to DBoardHeader */}
            <DBoardHeader isGuest={true} linkedToUsername={userName} />
            <DashBoardContent userName={userName} />
        </div>
    );
};

export default GuestDashBoard;
