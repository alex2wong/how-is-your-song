/**
 * 原生 Toast 实现，不依赖 React 组件
 * 可以在任何地方调用，包括非 React 环境
 */

// 颜色配置
const TOAST_COLORS = {
  info: '#1890ff',
  success: '#52c41a',
  error: '#ff4d4f',
  warning: '#faad14'
};

// 显示原生 toast 消息
export const showNativeToast = (message, type = 'info', duration = 5000) => {
  // 创建 toast 元素
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.top = '20px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.padding = '12px 24px';
  toast.style.borderRadius = '4px';
  toast.style.color = '#fff';
  toast.style.backgroundColor = TOAST_COLORS[type] || TOAST_COLORS.info;
  toast.style.fontSize = '14px';
  toast.style.zIndex = '10000';
  toast.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
  toast.style.transition = 'all 0.3s ease';
  
  // 添加到文档
  document.body.appendChild(toast);
  
  // 淡入效果
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10);
  
  // 淡出效果
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, duration);
  
  // 控制台输出，便于调试
  console.log(`[Native Toast] ${type}: ${message}`);
  
  return toast;
};

// 导出不同类型的 toast 函数
export const showInfoToast = (message, duration) => showNativeToast(message, 'info', duration);
export const showSuccessToast = (message, duration) => showNativeToast(message, 'success', duration);
export const showErrorToast = (message, duration) => showNativeToast(message, 'error', duration);
export const showWarningToast = (message, duration) => showNativeToast(message, 'warning', duration);

// 将函数挂载到 window 对象，以便在控制台中调用
if (typeof window !== 'undefined') {
  window.showNativeToast = showNativeToast;
  window.showInfoToast = showInfoToast;
  window.showSuccessToast = showSuccessToast;
  window.showErrorToast = showErrorToast;
  window.showWarningToast = showWarningToast;
}
