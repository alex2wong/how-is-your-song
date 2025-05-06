import React from 'react';
import { RiVideoUploadLine } from 'react-icons/ri';

/**
 * 生成按钮组件
 */
const GenerateButton = ({ 
  handleGenerateMV, 
  generating, 
  statusText 
}) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <button
        onClick={handleGenerateMV}
        disabled={generating}
        style={{
          backgroundColor: generating ? '#a0aec0' : '#6B66FF',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '15px 24px',
          fontWeight: 'bold',
          cursor: generating ? 'not-allowed' : 'pointer',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          fontSize: '1.1rem'
        }}
      >
        <RiVideoUploadLine />
        {generating ? '生成中...' : '开始生成MV'}
      </button>
      
      {generating && (
        <div style={{ marginTop: '15px' }}>
          <div style={{ 
            fontSize: '0.9rem', 
            color: '#718096', 
            textAlign: 'center',
            marginBottom: '15px'
          }}>
            {statusText || '正在生成视频...'}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateButton;
