import React, { useEffect, useState } from 'react';
import './DashBoardContent.css';
import useNavigateToLocker from '../../hooks/useNavigateToLocker';
//import { jwtDecode } from 'jwt-decode'; // Correct named import for jwt-de
import { useTheme } from '../../context/ThemeContext';


const DashBoardContent = ({ userName, isPremium, permissions }) => {
    const [lockers, setLockers] = useState([]);
    const navigateToLocker = useNavigateToLocker();
    const { theme } = useTheme();

    
    
    

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

    const hasAccessPermission = (lockerId) => {
        // If permissions prop is not provided, assume full access (for backward compatibility)
        if (!permissions) return true;
        // Check if the permissions object contains an entry for this lockerId with 'view' or 'access' permissions
        return permissions[lockerId]?.includes('view') || permissions[lockerId]?.includes('access');
    };

    const handleAddLockerClick = async () => {
        const lockerName = prompt('Enter locker name:');
        
        if (!lockerName) {
            alert('Locker name is required!');
            return;
        }
        
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/premium-lockers/add-locker`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lockerName, lockerType: 'Custom' }) // Use 'Custom' or a default locker type
            });
    
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error creating locker.');
            
            // Assuming the common image is stored at '/images/common-locker.png'
            const newLockerWithImage = { ...data, lockerImage: '/images/common-locker.png' };
            setLockers([...lockers, newLockerWithImage]);
            alert('Locker created successfully!');
        } catch (error) {
            console.error('Error creating new locker:', error);
            alert(error.message || 'An error occurred while creating the locker.');
        }
    };
    
    
    

    return (
        <div className={`dashboard-content ${isPremium ? theme : ''}`}>
             <h1>Welcome</h1>

            {/* Sections for recently used lockers can go here if implemented */}
            
            
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
                                    onClick={() => hasAccessPermission(locker._id) ? navigateToLocker(locker._id, locker.lockerName) : alert('You do not have permission to access this locker.')}
                                    disabled={!hasAccessPermission(locker._id)}
                                >
                                    Access Documents
                                </button>
                            </div>
                        </div>
                    ))}
                    {isPremium && (
    <div className="locker-card create-more-lockers" onClick={handleAddLockerClick}>
        <div className="add-locker-content">
            <i className="fas fa-plus"></i> {/* This is the plus icon */}
            <p>Create More Lockers</p>
        </div>
    </div>
)}

                </div>
            </section>
        </div>
    );
};

export default DashBoardContent;
