import React, { useRef, useState, useEffect } from 'react';
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
  setLyricsOffsetY = () => {},
  foregroundSize = 'medium',
  setForegroundSize = () => {},
  foregroundShape = 'roundedRect',
  setForegroundShape = () => {},
  foregroundAutoRotate = false,
  setForegroundAutoRotate = () => {}
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
              background: 'rgba(249, 3, 3, 0.8)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff'
            }}
          >
            X
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
            <>
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
              
              {/* 前景图尺寸选择 */}
              <div style={{ marginTop: '15px' }}>
                <div style={{ marginBottom: '5px' }}>
                  <label style={{ fontSize: '0.9rem', color: '#4A5568' }}>前景图尺寸</label>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => setForegroundSize('small')} 
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      border: `1px solid ${foregroundSize === 'small' ? '#6B66FF' : '#e2e8f0'}`,
                      borderRadius: '4px',
                      backgroundColor: foregroundSize === 'small' ? 'rgba(107, 102, 255, 0.1)' : 'white',
                      color: foregroundSize === 'small' ? '#6B66FF' : '#4A5568',
                      fontWeight: foregroundSize === 'small' ? 'bold' : 'normal',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    小
                  </button>
                  <button 
                    onClick={() => setForegroundSize('medium')} 
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      border: `1px solid ${foregroundSize === 'medium' ? '#6B66FF' : '#e2e8f0'}`,
                      borderRadius: '4px',
                      backgroundColor: foregroundSize === 'medium' ? 'rgba(107, 102, 255, 0.1)' : 'white',
                      color: foregroundSize === 'medium' ? '#6B66FF' : '#4A5568',
                      fontWeight: foregroundSize === 'medium' ? 'bold' : 'normal',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    中
                  </button>
                  <button 
                    onClick={() => setForegroundSize('large')} 
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      border: `1px solid ${foregroundSize === 'large' ? '#6B66FF' : '#e2e8f0'}`,
                      borderRadius: '4px',
                      backgroundColor: foregroundSize === 'large' ? 'rgba(107, 102, 255, 0.1)' : 'white',
                      color: foregroundSize === 'large' ? '#6B66FF' : '#4A5568',
                      fontWeight: foregroundSize === 'large' ? 'bold' : 'normal',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    大
                  </button>
                  <button 
                    onClick={() => setForegroundSize('extraLarge')} 
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      border: `1px solid ${foregroundSize === 'extraLarge' ? '#6B66FF' : '#e2e8f0'}`,
                      borderRadius: '4px',
                      backgroundColor: foregroundSize === 'extraLarge' ? 'rgba(107, 102, 255, 0.1)' : 'white',
                      color: foregroundSize === 'extraLarge' ? '#6B66FF' : '#4A5568',
                      fontWeight: foregroundSize === 'extraLarge' ? 'bold' : 'normal',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    特大
                  </button>
                </div>
              </div>
              
              {/* 前景图形状选择 */}
              <div style={{ marginTop: '15px' }}>  
                <div style={{ marginBottom: '5px' }}>
                  <label style={{ fontSize: '0.9rem', color: '#4A5568' }}>前景图形状</label>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => setForegroundShape('roundedRect')} 
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      border: `1px solid ${foregroundShape === 'roundedRect' ? '#6B66FF' : '#e2e8f0'}`,
                      borderRadius: '4px',
                      backgroundColor: foregroundShape === 'roundedRect' ? 'rgba(107, 102, 255, 0.1)' : 'white',
                      color: foregroundShape === 'roundedRect' ? '#6B66FF' : '#4A5568',
                      fontWeight: foregroundShape === 'roundedRect' ? 'bold' : 'normal',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    圆角矩形
                  </button>
                  <button 
                    onClick={() => setForegroundShape('circle')} 
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      border: `1px solid ${foregroundShape === 'circle' ? '#6B66FF' : '#e2e8f0'}`,
                      borderRadius: '4px',
                      backgroundColor: foregroundShape === 'circle' ? 'rgba(107, 102, 255, 0.1)' : 'white',
                      color: foregroundShape === 'circle' ? '#6B66FF' : '#4A5568',
                      fontWeight: foregroundShape === 'circle' ? 'bold' : 'normal',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    圆形
                  </button>
                </div>
              </div>
              
              {/* 前景图自动旋转选项 */}
              <div style={{ marginTop: '15px' }}>  
                <div style={{ marginBottom: '5px' }}>
                  <label style={{ fontSize: '0.9rem', color: '#4A5568' }}>前景图自动旋转</label>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => setForegroundAutoRotate(true)} 
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      border: `1px solid ${foregroundAutoRotate ? '#6B66FF' : '#e2e8f0'}`,
                      borderRadius: '4px',
                      backgroundColor: foregroundAutoRotate ? 'rgba(107, 102, 255, 0.1)' : 'white',
                      color: foregroundAutoRotate ? '#6B66FF' : '#4A5568',
                      fontWeight: foregroundAutoRotate ? 'bold' : 'normal',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    是
                  </button>
                  <button 
                    onClick={() => setForegroundAutoRotate(false)} 
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      border: `1px solid ${!foregroundAutoRotate ? '#6B66FF' : '#e2e8f0'}`,
                      borderRadius: '4px',
                      backgroundColor: !foregroundAutoRotate ? 'rgba(107, 102, 255, 0.1)' : 'white',
                      color: !foregroundAutoRotate ? '#6B66FF' : '#4A5568',
                      fontWeight: !foregroundAutoRotate ? 'bold' : 'normal',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    否
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackgroundImageSelector;
