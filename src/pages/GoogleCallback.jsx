import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/Auth/AuthContext';
import { fetchApi } from '../utils/api';

// Google登录回调处理页面
const GoogleCallback = () => {
  const { login } = useAuth();
  const [status, setStatus] = useState('处理中...');
  const [error, setError] = useState(null);

  useEffect(() => {
    // 从URL中获取授权码
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (!code) {
      setStatus('错误');
      setError('未找到授权码');
      return;
    }
    
    // 处理Google登录回调
    const handleCallback = async () => {
      try {
        // 将授权码发送到后端
        const response = await fetchApi('api/auth/google/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ code }),
        });
        
        const data = await response.json();
        if (data.success) {
          // 登录成功
          login(data.user, data.token);
          setStatus('登录成功');
          
          // 重定向回主页
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        } else {
          setStatus('登录失败');
          setError(data.message || '登录处理失败');
        }
      } catch (error) {
        console.error('处理Google回调失败:', error);
        setStatus('登录失败');
        setError(error.message || '登录处理失败');
      }
    };
    
    handleCallback();
  }, [login]);
  
  return (
    <div className="google-callback-container" style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h2>Google 登录</h2>
      <div className="status" style={{ marginTop: '20px', fontSize: '18px' }}>
        {status}
      </div>
      {error && (
        <div className="error" style={{ 
          marginTop: '20px', 
          color: 'red',
          padding: '10px',
          backgroundColor: '#ffebee',
          borderRadius: '5px',
          maxWidth: '400px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default GoogleCallback;
