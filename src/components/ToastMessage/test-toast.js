// 这是一个测试脚本，用于测试全局 toast 消息系统

// 导入全局 toast 函数
import { showGlobalToast } from './globalToast';

// 测试函数
export function testToast() {
  console.log('测试 toast 消息...');
  showGlobalToast('这是一条测试 toast 消息', 'info', 5000);
  
  // 测试错误类型的 toast
  setTimeout(() => {
    showGlobalToast('这是一条错误 toast 消息', 'error', 5000);
  }, 2000);
  
  // 测试成功类型的 toast
  setTimeout(() => {
    showGlobalToast('这是一条成功 toast 消息', 'success', 5000);
  }, 4000);
}

// 将测试函数挂载到 window 对象上，以便在控制台中调用
if (typeof window !== 'undefined') {
  window.testToast = testToast;
}

console.log('Toast 测试脚本已加载，可以在控制台中调用 window.testToast() 来测试 toast 消息');
