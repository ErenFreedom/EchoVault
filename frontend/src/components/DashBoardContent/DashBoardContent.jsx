import React from 'react';
import './DashBoardContent.css';
import useNavigateToLocker from '../../hooks/useNavigateToLocker'; // Import the custom hook

const DashBoardContent = ({ userName, isPremium }) => {
    const navigateToLocker = useNavigateToLocker(); // Initialize the custom hook

    // Placeholder data for recently used lockers and available lockers
    // const recentlyUsedLockers = [
    //     // Add recently used locker data here
    // ];
    
    const availableLockers = [
        { name: 'Personal', description: 'Your personal documents', imgSrc: '/images/Personal.png' },
        { name: 'Medical', description: 'Your healthcare records', imgSrc: '/images/Medical.png' },
        { name: 'Finance', description: 'Your financial statements', imgSrc: '/images/Finance.png' },
        { name: 'Education', description: 'Your educational certificates', imgSrc: '/images/Education.png' },
        { name: 'Property', description: 'Your property deeds', imgSrc: '/images/Property.png' },
        { name: 'Travel', description: 'Your travel documents', imgSrc: '/images/Travel.png' },
        { name: 'Legal', description: 'Your legal papers', imgSrc: '/images/Legal.png' }
        // Potentially more lockers...
    ];

    // Function to handle the creation of more lockers
    // This could navigate to a form or trigger a modal for locker creation
    const handleCreateMoreLockers = () => {
        console.log("Create more lockers clicked");
    };

    return (
        <div className="dashboard-content">
            <h1>Welcome {userName},</h1>
            
            <section className="recently-used-lockers">
                <h2>Recently Used Lockers</h2>
                <div className="lockers-grid">
                    {/* Iterate over recentlyUsedLockers to generate locker cards */}
                </div>
            </section>
            
            <section className="available-lockers">
                <h2>Available Lockers</h2>
                <div className="lockers-grid">
                    {availableLockers.map((locker, index) => (
                        <div className="locker-card" key={index}>
                            <img src={locker.imgSrc} alt={`${locker.name} Locker`} className="locker-image" />
                            <div className="locker-details">
                                <h3>{locker.name} Locker</h3>
                                <p>{locker.description}</p>
                                <button 
                                    className="locker-button"
                                    onClick={() => navigateToLocker(locker.name)}
                                >
                                    Know More
                                </button>
                            </div>
                        </div>
                    ))}
                    {/* Conditional rendering of the 'Create More Lockers' card for premium users */}
                    {isPremium && (
                        <div className="locker-card create-more-lockers" onClick={handleCreateMoreLockers}>
                            <div className="locker-details">
                                <div className="create-locker-plus">+</div>
                                <p>Create more lockers</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default DashBoardContent;
