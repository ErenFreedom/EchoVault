import React from 'react';
import Header from '../../components/Header/Header';
import DynamicText from '../../components/DynamicText/DynamicText';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-page">
      <Header />
      <div className="landing-content">
        <DynamicText />
        <p>More information about EchoVault could go here.</p>
        <button className="learn-more">Learn More</button>
      </div>
    </div>
  );
};

export default Landing;
