// 标准的 Google OAuth 登录流程
import { fetchApi } from '../../utils/api';

// 获取 Google 客户端 ID
export const getGoogleClientId = async () => {
  try {
    const response = await fetchApi('api/auth/google-client-id');
    const data = await response.json();
    return data.clientId;
  } catch (error) {
    console.error('获取 Google 客户端 ID 失败:', error);
    throw error;
  }
};

// 初始化 Google OAuth 客户端
export const initGoogleAuth = async () => {
  // 确保 Google API 客户端库已加载
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
};

// 开始 Google 登录流程
export const startGoogleLogin = async () => {
  try {
    console.log('开始 Google 登录流程');
    
    // 初始化 Google 认证
    await initGoogleAuth();
    console.log('Google 认证初始化成功');
    
    // 获取客户端 ID
    const clientId = await getGoogleClientId();
    console.log('获取到 Google 客户端 ID:', clientId ? '成功' : '失败');
    
    // 构建 OAuth 授权 URL
    // 使用固定的重定向URI，必须与Google Cloud Console中配置的完全一致
    // 根据您在Google Cloud Console中的配置使用正确的URI
    const redirectUri = 'http://localhost:5173/auth/google/callback';
    const scope = 'email profile';
    const responseType = 'code';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}`;
    
    console.log('构建的 Google 授权 URL:', authUrl);
    console.log('重定向 URI:', redirectUri);
    
    // 重定向到 Google 登录页面
    window.location.href = authUrl;
  } catch (error) {
    console.error('启动 Google 登录失败:', error);
    throw error;
  }
};

// 处理 Google 登录回调
export const handleGoogleCallback = async (code) => {
  try {
    // 将授权码发送到后端，由后端完成令牌交换和用户信息获取
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
      return {
        user: data.user,
        token: data.token
      };
    } else {
      throw new Error(data.message || '登录失败');
    }
  } catch (error) {
    console.error('处理 Google 回调失败:', error);
    throw error;
  }
};
