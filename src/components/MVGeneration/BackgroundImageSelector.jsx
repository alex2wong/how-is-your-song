import React, { useRef } from 'react';
import { RiImageAddLine, RiFileUploadLine } from 'react-icons/ri';
import { handleBackgroundChange, handleClearBackground } from './fileUtils';

/**
 * 背景和前景选择组件（支持图片和视频）
 */
const BackgroundImageSelector = ({ 
  backgroundImage, 
  setBackgroundImage, 
  foregroundImage = null,
  setForegroundImage = () => {},
  backgroundInputRef = null,
  foregroundInputRef = null,
  imageInputRef = null, // 兼容旧版接口
  foregroundOffsetY = 0,
  setForegroundOffsetY = () => {},
  lyricsOffsetY = 0,
  setLyricsOffsetY = () => {}
}) => {
  // 兼容旧版接口，如果使用旧版imageInputRef，则将其用作背景图片的ref
  const actualBackgroundInputRef = backgroundInputRef || imageInputRef;
  // 如果没有提供前景图片的ref，创建一个新的ref
  const defaultForegroundRef = useRef(null);
  const actualForegroundInputRef = foregroundInputRef || defaultForegroundRef;
  // 图片选择器组件
  const ImageSelector = ({ 
    image, 
    setImage, 
    inputRef, 
    title, 
    placeholder 
  }) => (
    <div style={{ marginBottom: '20px' }}>
      <h4 style={{ marginBottom: '8px', fontSize: '1rem', color: '#4A5568' }}>{title}</h4>
      {!image ? (
        <div 
          style={{
            border: '2px dashed #e2e8f0',
            borderRadius: '8px',
            padding: '15px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: '#f8fafc',
            height: '150px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onClick={() => inputRef.current.click()}
        >
          <RiImageAddLine style={{ fontSize: '1.8rem', color: '#6B66FF', marginBottom: '8px' }} />
          <p style={{ color: '#718096', fontSize: '0.9rem' }}>{placeholder}</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/mp4,video/gif"
            onChange={(e) => handleBackgroundChange(e, setImage)}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div style={{ position: 'relative', height: '150px' }}>
          {image.type === 'image' ? (
            <img 
              src={image.preview} 
              alt="图片预览" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }} 
            />
          ) : (
            <video 
              src={image.preview} 
              alt="视频预览" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }} 
              autoPlay
              loop
              muted
              playsInline
            />
          )}
          <button 
            onClick={() => handleClearBackground(image, setImage, inputRef)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(255, 255, 255, 0.8)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
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

  // 滑块组件
  const PositionSlider = ({ title, value, onChange, min = -200, max = 200 }) => (
    <div style={{ marginTop: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
        <label style={{ fontSize: '0.9rem', color: '#4A5568' }}>{title}</label>
        <span style={{ fontSize: '0.8rem', color: '#718096' }}>{value}px</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))} 
        style={{ 
          width: '100%', 
          height: '8px',
          WebkitAppearance: 'none',
          appearance: 'none',
          borderRadius: '4px',
          background: 'linear-gradient(to right, #6B66FF, #A5B4FC)',
          outline: 'none',
          cursor: 'pointer'
        }} 
      />
    </div>
  );

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '15px', fontSize: '1.1rem', color: '#4A5568' }}>4. 选择背景</h3>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <ImageSelector 
            image={backgroundImage}
            setImage={setBackgroundImage}
            inputRef={actualBackgroundInputRef}
            title="选择背景图（可选）"
            placeholder="点击选择背景图片"
          />
        </div>
        <div style={{ flex: 1 }}>
          <ImageSelector 
            image={foregroundImage}
            setImage={setForegroundImage}
            inputRef={actualForegroundInputRef}
            title="选择前景图（可选）"
            placeholder="点击选择前景图片"
          />
          {foregroundImage && (
            <div style={{ marginTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label style={{ fontSize: '0.9rem', color: '#4A5568' }}>前景图垂直位置调整</label>
                <span style={{ fontSize: '0.8rem', color: '#718096' }}>{foregroundOffsetY}px</span>
              </div>
              <input 
                type="range" 
                min={-500} 
                max={500} 
                value={foregroundOffsetY} 
                onChange={(e) => setForegroundOffsetY(parseInt(e.target.value))} 
                style={{ 
                  width: '100%', 
                  height: '8px',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  borderRadius: '4px',
                  background: 'linear-gradient(to right, #6B66FF, #A5B4FC)',
                  outline: 'none',
                  cursor: 'pointer'
                }} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackgroundImageSelector;
