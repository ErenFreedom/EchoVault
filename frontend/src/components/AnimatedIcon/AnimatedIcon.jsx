import React, { useState, useEffect } from 'react';
import './AnimatedIcon.css'; // Ensure this path is correct

const AnimatedIcon = () => {
  const [style, setStyle] = useState({
    transform: 'scale(1)',
    opacity: 1,
    transition: 'transform 0.5s ease, opacity 0.5s ease' // Smooth transitions
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Toggle styles or add logic for animation
      setStyle(prevStyle => ({
        ...prevStyle, // Spread the existing styles
        transform: prevStyle.transform === 'scale(1)' ? 'scale(1.1)' : 'scale(1)',
        opacity: prevStyle.opacity === 1 ? 0.8 : 1,
      }));
    }, 5000); // Change style every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <img 
      src={process.env.PUBLIC_URL + "/images/Icon2.png"} 
      alt="Animated Icon" 
      className="animated-icon" 
      style={style} // Apply the dynamic styles here
    />
  );
};

export default AnimatedIcon;
