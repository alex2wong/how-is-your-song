import React, { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';

/**
 * 通用模态窗口组件
 * @param {Object} props - 组件属性
 * @param {string} props.title - 模态窗口标题
 * @param {Function} props.onClose - 关闭模态窗口的回调函数
 * @param {React.ReactNode} props.children - 模态窗口内容
 * @param {string} [props.width] - 模态窗口宽度
 */
const Modal = ({ title, onClose, children, width = '80%' }) => {
  // 按ESC键关闭模态窗口
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // 阻止点击模态窗口内容时冒泡到背景
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          width: width,
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={handleModalContentClick}
      >
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 20px',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '5px',
            }}
          >
            <IoClose />
          </button>
        </div>
        <div style={{ overflow: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
