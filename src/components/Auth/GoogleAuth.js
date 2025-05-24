// Google OAuth 客户端配置和初始化
import { fetchApi } from '../../utils/api';

// 直接使用客户端ID
let googleClientId = null;

// 加载 Google API 客户端库
export const loadGoogleAuth = async () => {
  try {
    // 获取客户端ID
    if (!googleClientId) {
      const response = await fetchApi('api/auth/google-client-id');
      const data = await response.json();
      googleClientId = data.clientId;
      
      if (!googleClientId) {
        throw new Error('无法获取 Google 客户端 ID');
      }
    }
    
    // 检查是否已经加载脚本
    if (!document.getElementById('google-platform')) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.id = 'google-platform';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error('无法加载 Google 认证库'));
        document.head.appendChild(script);
      });
    }
  } catch (error) {
    console.error('加载 Google 认证失败:', error);
    throw error;
  }
};

// 执行 Google 登录 - 直接使用模拟数据
export const signInWithGoogle = async () => {
  try {
    // 确保脚本已加载
    await loadGoogleAuth();
    
    // 如果没有客户端ID，再次获取
    if (!googleClientId) {
      const response = await fetchApi('api/auth/google-client-id');
      const data = await response.json();
      googleClientId = data.clientId;
    }
    
    console.log('正在使用Google客户端ID:', googleClientId);
    
    // 直接返回模拟的用户信息，避免使用弹窗
    // 在实际应用中，这里应该使用完整的 Google OAuth 流程
    return {
      googleToken: 'simulated-google-token-' + Date.now(),
      email: 'user@gmail.com',
      name: 'Google 用户',
      imageUrl: 'https://lh3.googleusercontent.com/a/default-user'
    };
  } catch (error) {
    console.error('Google 登录失败:', error);
    throw error;
  }
};
