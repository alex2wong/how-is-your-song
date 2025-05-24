// API基础URL
export const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '/';

// 构建完整的API URL
export const buildApiUrl = (endpoint) => {
  // 确保endpoint不以/开头
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${normalizedEndpoint}`;
};

// 封装fetch请求，自动添加API基础URL
export const fetchApi = async (endpoint, options = {}) => {
  const url = buildApiUrl(endpoint);
  return fetch(url, options);
};
