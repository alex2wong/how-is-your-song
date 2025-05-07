import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastMessage from './index';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info',
    duration: 2000
  });

  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    setToast({
      visible: true,
      message,
      type,
      duration
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast.visible && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
};

// 自定义 Hook
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}; 