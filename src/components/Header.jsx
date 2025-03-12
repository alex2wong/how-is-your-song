import React from 'react';
import { RiMusic2Fill, RiSettings4Line } from 'react-icons/ri';
import Settings from './Settings';

const Header = () => {
  return (
    <nav className="nav-header">
      <div className="logo">
        <RiMusic2Fill className="logo-icon" />
        <div>
          <div className="logo-text">爱乐评</div>
          <div className="logo-domain">aiyueping.com</div>
        </div>
      </div>
      
      <div className="nav-links">
        <Settings>
          <RiSettings4Line />
          设置
        </Settings>
      </div>
    </nav>
  );
};

export default Header;
