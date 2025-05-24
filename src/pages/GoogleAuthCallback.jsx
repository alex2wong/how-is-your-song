import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/api';

// 调试辅助函数
const logDebug = (message, data) => {
  console.log(`[GoogleAuthCallback] ${message}`, data || '');
};

// 简化的Google登录回调处理页面
const GoogleAuthCallback = () => {
  const [status, setStatus] = useState('处理中...');
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const maxRetries = 3;

  // 处理Google登录回调
  const handleCallback = async (code) => {
    try {
      logDebug('开始处理回调', { retryCount });
      
      // 将授权码发送到后端
      // 使用直接请求而不是fetchApi，避免跨域问题
      const apiUrl = `http://localhost:3000/api/auth/google/callback?code=${code}`;
      logDebug('请求后端 API', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      logDebug('收到后端响应', response.status);
      
      // 检查响应类型
      const contentType = response.headers.get('content-type');
      logDebug('响应内容类型', contentType);
      
      // 先获取响应文本，然后再尝试解析JSON
      const text = await response.text();
      logDebug('原始响应文本', text.substring(0, 100) + '...');
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        logDebug('JSON解析错误', e);
        throw new Error(`服务器响应不是有效的JSON: ${text.substring(0, 50)}...`);
      }
      logDebug('响应数据', data);
      
      if (data.success) {
        // 登录成功
        logDebug('登录成功');
        setStatus('登录成功，正在跳转...');
        
        // 将用户信息存储到本地
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // 重定向回主页
        logDebug('准备重定向到首页');
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
        return true;
      } else {
        // 登录失败
        logDebug('登录失败', data.message);
        setStatus('登录失败');
        setError(data.message || '登录处理失败');
        return false;
      }
    } catch (error) {
      logDebug('处理回调异常', error);
      setStatus('登录失败');
      setError(error.message || '登录处理失败');
      return false;
    }
  };
  


  useEffect(() => {
    logDebug('组件加载');
    
    // 从URL中获取授权码
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    logDebug('从 URL 获取的授权码', code);
    
    if (!code) {
      setStatus('错误');
      setError('未找到授权码');
      logDebug('错误: 未找到授权码');
      return;
    }
    
    // 开始处理回调
    const processCallback = async () => {
      const success = await handleCallback(code);
      
      // 如果失败且重试次数未超过上限，则重试
      if (!success && retryCount < maxRetries) {
        logDebug('将在 2 秒后重试', { retryCount: retryCount + 1 });
        setIsRetrying(true);
        setStatus(`登录失败，正在重试 (${retryCount + 1}/${maxRetries})...`);
        
        // 等待 2 秒后重试
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          setIsRetrying(false);
        }, 2000);
      } else if (!success && retryCount >= maxRetries) {
        // 重试次数已超过上限，显示错误信息
        logDebug('重试次数已超过上限');
        setStatus('登录失败');
        setError('登录失败，请返回首页重新登录');
      }
    };
    
    if (!isRetrying) {
      processCallback();
    }
  }, [retryCount, isRetrying]);
  
  // 返回首页的处理函数
  const handleReturnHome = () => {
    window.location.href = '/';
  };

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
      
      {/* 如果出现错误，显示返回首页按钮 */}
      {error && (
        <button 
          onClick={handleReturnHome}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          返回首页
        </button>
      )}
    </div>
  );
};

export default GoogleAuthCallback;
