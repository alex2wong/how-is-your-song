import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchApi } from '../../utils/api';

// 创建认证上下文
const AuthContext = createContext(null);

// 认证提供器组件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(null);

  // 初始化时检查用户是否已登录
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await fetchApi('api/auth/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          const data = await response.json();
          if (data.success) {
            setUser(data.user);
          } else {
            // 令牌无效，清除本地存储
            logout();
          }
        } catch (error) {
          console.error('检查认证状态错误:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  // 登录函数
  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
  };

  // 登出函数
  const logout = async () => {
    try {
      // 调用登出API
      await fetchApi('api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error('登出错误:', error);
    }

    // 清除本地状态
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  // 更新用户积分
  const updateUserCredits = (newCredits) => {
    if (user) {
      setUser({ ...user, credits: newCredits });
    }
  };

  // 请求登录（用于需要登录的操作）
  const requireLogin = (redirectPath = null) => {
    setAuthRequired(true);
    setShowLoginModal(true);
    if (redirectPath) {
      setRedirectAfterLogin(redirectPath);
    }
  };

  // 登录成功后的处理
  const handleLoginSuccess = (userData, userToken) => {
    login(userData, userToken);
    setShowLoginModal(false);
    setAuthRequired(false);
    
    // 如果有重定向路径，执行重定向
    if (redirectAfterLogin) {
      // 在实际应用中，这里可以使用路由导航
      // 例如：navigate(redirectAfterLogin);
      setRedirectAfterLogin(null);
    }
  };

  // 提供上下文值
  const value = {
    user,
    token,
    loading,
    showLoginModal,
    setShowLoginModal,
    authRequired,
    login,
    logout,
    requireLogin,
    handleLoginSuccess,
    updateUserCredits
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定义钩子，方便使用认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
};
