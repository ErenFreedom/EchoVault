import React, { useEffect, useState } from 'react';
import './DashBoardContent.css';
import useNavigateToLocker from '../../hooks/useNavigateToLocker';

const DashBoardContent = ({ userName, isPremium }) => {
    const [lockers, setLockers] = useState([]);
    const navigateToLocker = useNavigateToLocker();

    useEffect(() => {
        const fetchLockers = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/lockers/user-lockers`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                    },
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Error fetching lockers.');
                setLockers(data); // Assuming the response contains an array of lockers
            } catch (error) {
                console.error('Error fetching user lockers:', error);
            }
        };

        fetchLockers();
    }, [userName]); // Dependency array includes userName to refetch when it changes

    const lockerImages = {
        Personal: '/images/Personal.png',
        Medical: '/images/Medical.png',
        Finance: '/images/Finance.png',
        Education: '/images/Education.png',
        Property: '/images/Property.png',
        Travel: '/images/Travel.png',
        Legal: '/images/Legal.png'
    };

    const getLockerImage = (lockerType) => {
        return lockerImages[lockerType] || '/images/default.png'; // Fallback to a default image
    };

    return (
        <div className="dashboard-content">
            <h1>Welcome {userName},</h1>

            {/* Sections for recently used lockers can go here if implemented */}
            <section className="recently-used-lockers">
                <h2>Recently Used Lockers</h2>
                <div className="lockers-grid">
                    {/* Iterate over recentlyUsedLockers to generate locker cards */}
                </div>
            </section>
            
            <section className="available-lockers">
                <h2>Available Lockers</h2>
                <div className="lockers-grid">
                    {lockers.map((locker) => (
                        <div className="locker-card" key={locker._id}>
                            <img src={getLockerImage(locker.lockerType)} alt={`${locker.lockerName} Locker`} className="locker-image" />
                            <div className="locker-details">
                                <h3>{locker.lockerName}</h3>
                               
                                <button 
                                    className="locker-button"
                                    onClick={() => navigateToLocker(locker._id, locker.lockerName)}
                                >
                                    Access Documents
                                </button>
                            </div>
                        </div>
                    ))}
                    {isPremium && (
                        <div className="locker-card create-more-lockers" >
                            {/* ... */}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default DashBoardContent;
