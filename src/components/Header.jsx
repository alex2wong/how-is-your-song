import React from 'react';
import { FaGithub } from 'react-icons/fa';
import Settings from './Settings';

const Header = () => {
  return (
    <>
      <a
        href="https://github.com/alex2wong/how-is-your-song.git"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          color: '#333',
          fontSize: '24px'
        }}
      >
        <FaGithub />
      </a>
      <img src='/logo.png' className="app-logo" alt="logo" style={{ width: '188px' }} />
      <Settings />
    </>
  );
};

export default Header;
