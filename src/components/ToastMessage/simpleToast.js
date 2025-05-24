/**
 * 简单的原生 Toast 实现
 * 不依赖任何框架，可以在任何地方调用
 */

// 创建样式
const createToastStyle = () => {
  if (document.getElementById('simple-toast-style')) return;
  
  const style = document.createElement('style');
  style.id = 'simple-toast-style';
  style.textContent = `
    .simple-toast {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      border-radius: 4px;
      color: #fff;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .simple-toast-info {
      background-color: #1890ff;
    }
    
    .simple-toast-success {
      background-color: #52c41a;
    }
    
    .simple-toast-error {
      background-color: #ff4d4f;
    }
    
    .simple-toast-warning {
      background-color: #faad14;
    }
  `;
  
  document.head.appendChild(style);
};

// 显示 toast 消息
const showToast = (message, type = 'info', duration = 3000) => {
  // 确保样式已创建
  createToastStyle();
  
  // 创建 toast 元素
  const toast = document.createElement('div');
  toast.className = `simple-toast simple-toast-${type}`;
  toast.textContent = message;
  
  // 添加到文档
  document.body.appendChild(toast);
  
  // 淡入效果
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10);
  
  // 淡出并移除
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, duration);
  
  // 控制台输出，便于调试
  console.log(`[Simple Toast] ${type}: ${message}`);
};

// 导出不同类型的 toast 函数
export const showInfoToast = (message, duration) => showToast(message, 'info', duration);
export const showSuccessToast = (message, duration) => showToast(message, 'success', duration);
export const showErrorToast = (message, duration) => showToast(message, 'error', duration);
export const showWarningToast = (message, duration) => showToast(message, 'warning', duration);

// 将函数挂载到 window 对象，以便在控制台中调用
if (typeof window !== 'undefined') {
  window.showToast = showToast;
  window.showInfoToast = showInfoToast;
  window.showSuccessToast = showSuccessToast;
  window.showErrorToast = showErrorToast;
  window.showWarningToast = showWarningToast;
}

export default showToast;
