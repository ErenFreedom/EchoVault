import React from 'react';
import './info.css';
import backgroundImage from '../../assets/images/background.png';

const Info = () => {
  return (
    <div className="info-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="info-overlay"></div> {/* Overlay for text visibility */}
      <div className="info-text">
        <h1>Welcome to EchoVault</h1>
        <p>Discover the ease and security of storing all your important documents in one place. EchoVault is your personal digital locker, designed to keep your documents safe and accessible from anywhere. With state-of-the-art encryption and user-friendly features, managing your documents has never been easier. The project "Personal Digital Locker" aims to create a secure, user-friendly online space for individuals to store,
            manage, and access their personal and official documents. As we move towards a more digital era, the need for easily
            accessible yet secure digital storage is critical. This platform addresses this need by providing a safe repository where
            users can upload and retrieve their documents as required.<p/>
            <p>This system is developed using the MERN stack, ensuring a robust and scalable application. It offers features such as
            document upload, categorization, and secure sharing with time-bound access. Premium users benefit from additional
            storage and enhanced functionalities, reflecting a real-world subscription-based service model. To further safeguard
            user data, advanced security measures are implemented, including encrypted sessions and secure file handling
            protocols.</p>
            The locker also introduces a feedback mechanism where users can rate their experience and provide comments,
            driving continuous improvement of the service based on user input. This project represents the practical use of digital
            tools in our daily lives, aiming to make document management simple and secure. It's about giving people a digital
            helping hand for the safekeeping of their most important information.</p>
      </div>
    </div>            
  );
};

export default Info;
