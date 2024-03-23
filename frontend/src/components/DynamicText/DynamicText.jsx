import React, { useState, useEffect } from 'react';
import './DynamicText.css'; // Make sure to create DynamicText.css in the same folder

const textContent = [
  "All Verified documents in one place",
  "Access and share your documents anytime anywhere",
  "You can insert some info of your own regarding this project",
];

const DynamicText = () => {
  const [dynamicText, setDynamicText] = useState(textContent[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDynamicText((prevText) => textContent[(textContent.indexOf(prevText) + 1) % textContent.length]);
    }, 5000); // changes text every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  return <h2 className="dynamic-text">{dynamicText}</h2>;
};

export default DynamicText;
