import React, { useState, useEffect } from 'react';
import { RiCloseLine, RiGoogleFill, RiPhoneFill } from 'react-icons/ri';
import { fetchApi } from '../../utils/api';
import { startGoogleLogin } from './GoogleAuthStandard';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState('phone'); // 'phone' 或 'google'
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 处理发送验证码
  const handleSendVerificationCode = async () => {
    if (!phone || phone.length < 11) {
      setError('请输入有效的手机号码');
      return;
    }

    try {
      setLoading(true);
      const response = await fetchApi('api/auth/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();
      if (data.success) {
        setCountdown(60); // 60秒倒计时
        setError('');
      } else {
        setError(data.message || '发送验证码失败');
      }
    } catch (error) {
      console.error('发送验证码错误:', error);
      setError('发送验证码失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // 处理手机号登录
  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    
    if (!phone || !verificationCode) {
      setError('请输入手机号和验证码');
      return;
    }

    try {
      setLoading(true);
      const response = await fetchApi('api/auth/phone-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ phone, verificationCode }),
      });

      const data = await response.json();
      if (data.success) {
        // 登录成功，关闭弹窗并回调
        setError('');
        onLoginSuccess(data.user, data.token);
        onClose();
      } else {
        setError(data.message || '登录失败');
      }
    } catch (error) {
      console.error('登录错误:', error);
      setError('登录失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // 检查URL中是否有Google登录回调参数
  useEffect(() => {
    // 如果当前页面是Google回调页面，处理回调
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      setLoading(true);
      setError('');
      
      // 将授权码发送到后端
      fetchApi('api/auth/google/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ code }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // 登录成功，关闭弹窗并回调
          onLoginSuccess(data.user, data.token);
          onClose();
          
          // 清除URL中的参数
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          setError(data.message || '登录失败');
        }
      })
      .catch(error => {
        console.error('Google登录回调处理错误:', error);
        setError('登录失败，请稍后再试');
      })
      .finally(() => {
        setLoading(false);
      });
    }
  }, []);  // 空依赖数组表示只在组件挂载时运行一次

  // 处理Google登录
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 启动Google登录流程，这会将用户重定向到Google登录页面
      await startGoogleLogin();
      
      // 注意：这里不需要返回任何内容，因为用户将被重定向到Google登录页面
      // 登录成功后，用户将被重定向回应用，并在useEffect中处理回调
    } catch (error) {
      console.error('Google登录错误:', error);
      setError(error.message || '登录失败，请稍后再试');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay">
      <div className="login-modal">
        <button className="close-button" onClick={onClose}>
          <RiCloseLine />
        </button>
        
        <h2>登录</h2>
        <p className="login-subtitle">登录后可使用音乐分析功能</p>
        
        {/* 登录方式选项卡 */}
        <div className="login-tabs">
          <button 
            className={`login-tab ${activeTab === 'phone' ? 'active' : ''}`}
            onClick={() => setActiveTab('phone')}
          >
            <RiPhoneFill /> 手机号登录
          </button>
          <button 
            className={`login-tab ${activeTab === 'google' ? 'active' : ''}`}
            onClick={() => setActiveTab('google')}
          >
            <RiGoogleFill /> Google登录
          </button>
        </div>
        
        {/* 错误信息 */}
        {error && <div className="login-error">{error}</div>}
        
        {/* 手机号登录表单 */}
        {activeTab === 'phone' && (
          <form onSubmit={handlePhoneLogin} className="login-form">
            <div className="form-group">
              <label>手机号</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号"
                disabled={loading}
              />
            </div>
            
            <div className="form-group verification-code">
              <label>验证码</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="请输入验证码"
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleSendVerificationCode}
                disabled={countdown > 0 || loading}
                className="send-code-btn"
              >
                {countdown > 0 ? `${countdown}秒后重发` : '发送验证码'}
              </button>
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
        )}
        
        {/* Google登录按钮 */}
        {activeTab === 'google' && (
          <div className="google-login">
            <button 
              onClick={handleGoogleLogin} 
              className="google-login-button"
              disabled={loading}
            >
              <RiGoogleFill /> 使用Google账号登录
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
