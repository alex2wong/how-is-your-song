import React from 'react';
import { RiMusic2Fill, RiSettings4Line, RiLoginBoxLine, RiCoinLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import Settings from './Settings';
import { useAuth } from './Auth/AuthContext';
import UserInfo from './Auth/UserInfo';
import LoginModal from './Auth/LoginModal';

const Header = () => {
  const { user, showLoginModal, setShowLoginModal, handleLoginSuccess } = useAuth();

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
        {user ? (
          <>
            <UserInfo />
          </>
        ) : (
          <button 
            className="login-btn" 
            onClick={() => setShowLoginModal(true)}
          >
            <RiLoginBoxLine className="nav-icon" />
            登录
          </button>
        )}
        
        <Settings>
          <RiSettings4Line className="nav-icon" />
          设置
        </Settings>
        
        {/* 登录弹窗 */}
        {showLoginModal && (
          <LoginModal 
            isOpen={showLoginModal} 
            onClose={() => setShowLoginModal(false)} 
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </div>
    </nav>
  );
};

export default Header;
