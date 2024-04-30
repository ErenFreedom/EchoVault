import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import DynamicText from '../../components/DynamicText/DynamicText';
import AnimatedIcon from '../../components/AnimatedIcon/AnimatedIcon';
import Footer from '../../components/Footer/Footer';
import './Landing.css';

const Landing = () => {
  let navigate = useNavigate();

  const handleLearnMoreClick = () => {
    navigate('/login'); 
  };

  

  return (
    <div className="landing-page">
      <Header />
      <div className="left-content">
        <DynamicText />
        <p className="additional-info">More information about EchoVault could go here.</p>
        <button className="learn-more" onClick={handleLearnMoreClick}>Learn More</button>
        {/* Add the Sign Up button */}
        <AnimatedIcon />
      </div>
      <Footer /> {/* This is the Footer component */}
    </div>
  );
};

export default Landing;
