import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../../utils/api';
import axios from 'axios';

/**
 * API拦截器组件，用于处理API调用时的认证和积分相关响应
 * 拦截全局的fetch请求，处理认证和积分不足的情况
 */
const ApiInterceptor = () => {
  const { requireLogin, updateUserCredits } = useAuth();
  
  useEffect(() => {
    // 设置 axios 拦截器
    const axiosResponseInterceptor = axios.interceptors.response.use(
      // 成功响应处理
      (response) => {
        // 更新用户积分（如果响应中包含积分信息）
        if (response.data && response.data.userCredits !== undefined) {
          updateUserCredits(response.data.userCredits);
        }
        return response;
      },
      // 错误响应处理
      (error) => {
        // 检查是否是未授权错误
        if (error.response && error.response.status === 401) {
          const data = error.response.data;
          if (data && data.requireAuth) {
            console.log('Axios 拦截器: 检测到未授权错误，显示登录框');
            requireLogin();
            // 返回一个被拒绝的 Promise，但包含额外信息
            return Promise.reject({
              ...error,
              isAuthError: true,
              message: '请先登录'
            });
          }
        }
        
        // 处理积分不足错误
        if (error.response && error.response.status === 403) {
          const data = error.response.data;
          if (data && data.insufficientCredits) {
            alert('今日积分额度已耗尽，请明天再试或充值积分');
          }
        }
        
        return Promise.reject(error);
      }
    );
    
    // 保存原始fetch函数
    const originalFetch = window.fetch;
    
    // 重写fetch函数
    window.fetch = async function(url, options = {}) {
      // 如果URL不是以http开头，且不是以API_BASE_URL开头，则添加API_BASE_URL
      if (!url.startsWith('http') && !url.startsWith(API_BASE_URL)) {
        // 检查是否以/api开头
        if (url.startsWith('/api')) {
          url = `${API_BASE_URL}${url}`;
        } else if (url.startsWith('api')) {
          url = `${API_BASE_URL}/${url}`;
        }
      }
      
      // 调用原始fetch
      const response = await originalFetch(url, options);
      
      // 克隆响应以便多次读取
      const clonedResponse = response.clone();
      
      try {
        // 检查是否是JSON响应
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await clonedResponse.json();
          
          // 处理认证错误
          if (response.status === 401 && data.requireAuth) {
            console.log('Fetch 拦截器: 检测到未授权错误，显示登录框');
            requireLogin();
          }
          
          // 处理积分不足错误
          if (response.status === 403 && data.insufficientCredits) {
            alert('今日积分额度已耗尽，请明天再试或充值积分');
          }
          
          // 更新用户积分（如果响应中包含积分信息）
          if (data.userCredits !== undefined) {
            updateUserCredits(data.userCredits);
          }
        }
      } catch (error) {
        // 解析JSON失败，忽略错误
        console.error('API拦截器解析响应失败:', error);
      }
      
      // 返回原始响应
      return response;
    };
    
    // 清理函数，恢复原始fetch并移除axios拦截器
    return () => {
      window.fetch = originalFetch;
      axios.interceptors.response.eject(axiosResponseInterceptor);
    };
  }, [requireLogin, updateUserCredits]);
  
  // 这是一个纯功能组件，不渲染任何内容
  return null;
};

export default ApiInterceptor;
