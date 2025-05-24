// 全局 Toast 消息系统，可以在非 React 组件中使用

// 创建一个全局事件，用于触发 toast 消息
export const showGlobalToast = (message, type = 'info', duration = 5000) => {
  // 创建一个自定义事件
  const event = new CustomEvent('showToast', {
    detail: { message, type, duration }
  });
  
  // 触发事件
  window.dispatchEvent(event);
  
  // 同时在控制台输出消息，便于调试
  console.log(`[Toast] ${type}: ${message}`);
};

// 在 React 组件中监听这个事件
export const setupToastListener = (showToast) => {
  const handleShowToast = (event) => {
    const { message, type, duration } = event.detail;
    showToast(message, type, duration);
  };
  
  window.addEventListener('showToast', handleShowToast);
  
  // 返回清理函数
  return () => {
    window.removeEventListener('showToast', handleShowToast);
  };
};
