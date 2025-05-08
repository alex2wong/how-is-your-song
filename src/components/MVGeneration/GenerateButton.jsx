import React from 'react';
import { RiVideoUploadLine, RiRefreshLine, RiFileAddLine, RiStopCircleLine } from 'react-icons/ri';

/**
 * 生成按钮组件
 */
const GenerateButton = ({ 
  handleGenerateMV, 
  handleTerminateMV, // 添加终止生成的函数
  generating, 
  statusText,
  generatedMV,
  resetAllFields
}) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      {!generatedMV ? (
        // 未生成MV时显示生成按钮
        <div>
          {!generating ? (
            // 未生成状态显示开始生成按钮
            <button
              onClick={handleGenerateMV}
              style={{
                backgroundColor: '#6B66FF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '15px 24px',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1.1rem'
              }}
            >
              <RiVideoUploadLine />
              开始生成MV
            </button>
          ) : (
            // 生成中状态显示终止生成按钮
            <button
              onClick={handleTerminateMV}
              style={{
                backgroundColor: '#E53E3E',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '15px 24px',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1.1rem'
              }}
            >
              <RiStopCircleLine />
              终止生成
            </button>
          )}
        </div>
      ) : (
        // 已生成MV后显示两个按钮
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
            <RiRefreshLine />
            {generating ? '生成中...' : '重新生成MV'}
          </button>
          
          <button
            onClick={resetAllFields}
            disabled={generating}
            style={{
              backgroundColor: generating ? '#a0aec0' : '#4A5568',
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
            <RiFileAddLine />
            生成新的歌曲MV
          </button>
        </div>
      )}
      
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
