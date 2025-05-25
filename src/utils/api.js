// API基础URL
export const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/' : 'https://aiyueping.com/';

// 构建完整的API URL
export const buildApiUrl = (endpoint) => {
  // 确保endpoint不以/开头
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${normalizedEndpoint}`;
};

// 封装fetch请求，自动添加API基础URL和认证token
export const fetchApi = async (endpoint, options = {}) => {
  const url = buildApiUrl(endpoint);
  
  // 从 localStorage 获取 token
  const token = localStorage.getItem('token');
  
  // 如果有token，添加到请求头中
  if (token) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  
  // 确保请求包含凭证
  options.credentials = 'include';
  
  return fetch(url, options);
};
