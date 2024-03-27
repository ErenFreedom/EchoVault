import React from 'react';
import './Footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';
import { faGithub, faInstagram } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer className="footer">
      <a href="mailto:freedomyeager12@gmail.com" className="footer-icon">
        <FontAwesomeIcon icon={faEnvelope} />
      </a>
      <a href="https://github.com/ErenFreedom" target="_blank" rel="noopener noreferrer" className="footer-icon">
        <FontAwesomeIcon icon={faGithub} />
      </a>
      <a href="https://www.instagram.com/yeagerist1729" target="_blank" rel="noopener noreferrer" className="footer-icon">
        <FontAwesomeIcon icon={faInstagram} />
      </a>
    </footer>
  );
};

export default Footer;
