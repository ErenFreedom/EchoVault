import React from 'react';
import DBoardHeader from '../../components/Header/DBoardHeader'; 
import DashBoardContent from '../../components/DashBoardContent/DashBoardContent';
import './PremiumDashBoard.css'; 

const PremiumDashBoard = ({ userName }) => {
    return (
        <div className="premium-dashboard">
            <DBoardHeader isPremium={true} />
            {/* Pass isPremium prop to DashBoardContent */}
            <DashBoardContent userName={userName} isPremium={true} />
            {/* There's no need for the "Create More Lockers" card here anymore since it will be in DashBoardContent */}
        </div>
    );
};

export default PremiumDashBoard;
