import React from 'react';

/**
 * 预览画布组件
 */
const PreviewCanvas = ({ 
  canvasRef, 
  videoOrientation, 
  generating 
}) => {
  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#000',
      aspectRatio: videoOrientation === 'landscape' ? '16/9' : videoOrientation === 'landscape43' ? '4/3' : videoOrientation === 'square' ? '1/1' : '9/16',
      maxHeight: '300px',
      margin: '0 auto 20px auto',
      display: generating ? 'flex' : 'none',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }} 
      />
    </div>
  );
};

export default PreviewCanvas;
