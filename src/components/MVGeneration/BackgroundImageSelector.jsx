import React from 'react';
import { RiImageAddLine, RiFileUploadLine } from 'react-icons/ri';
import { handleImageChange, handleClearImage } from './fileUtils';

/**
 * 背景图片选择组件
 */
const BackgroundImageSelector = ({ 
  backgroundImage, 
  setBackgroundImage, 
  imageInputRef 
}) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', color: '#4A5568' }}>4. 选择背景图片</h3>
      {!backgroundImage ? (
        <div 
          style={{
            border: '2px dashed #e2e8f0',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: '#f8fafc'
          }}
          onClick={() => imageInputRef.current.click()}
        >
          <RiImageAddLine style={{ fontSize: '2rem', color: '#6B66FF', marginBottom: '10px' }} />
          <p style={{ color: '#718096' }}>点击选择背景图片（将根据视频方向自动裁剪）</p>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, setBackgroundImage)}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <img 
            src={backgroundImage.preview} 
            alt="背景图片预览" 
            style={{ 
              width: '100%', 
              maxWidth: '100%', 
              height: 'auto', 
              objectFit: 'contain', 
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }} 
          />
          <button 
            onClick={() => handleClearImage(backgroundImage, setBackgroundImage, imageInputRef)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(255, 255, 255, 0.8)',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#4A5568'
            }}
          >
            <RiFileUploadLine />
          </button>
        </div>
      )}
    </div>
  );
};

export default BackgroundImageSelector;
