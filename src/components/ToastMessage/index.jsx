import React, { useEffect } from 'react';
import './style.css';

const ToastMessage = ({ 
  message, 
  duration = 2000, 
  onClose,
  type = 'info' // 支持 'info', 'success', 'error', 'warning'
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast-message toast-${type}`}>
      {message}
    </div>
  );
};

export default ToastMessage; 