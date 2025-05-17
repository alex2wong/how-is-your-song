import React from 'react';

/**
 * 视频方向选择组件
 */
const VideoOrientationSelector = ({ videoOrientation, setVideoOrientation }) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', color: '#4A5568' }}>4. 选择视频方向</h3>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
        <div 
          onClick={() => setVideoOrientation('landscape')}
          style={{
            flex: '1',
            padding: '12px 8px',
            border: `2px solid ${videoOrientation === 'landscape' ? '#6B66FF' : '#e2e8f0'}`,
            borderRadius: '8px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: videoOrientation === 'landscape' ? 'rgba(107, 102, 255, 0.05)' : 'white'
          }}
        >
          <div style={{ 
            width: '72px', 
            height: '40px', 
            backgroundColor: '#e2e8f0',
            borderRadius: '4px',
            marginBottom: '8px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#718096',
            fontSize: '0.8rem'
          }}>16:9</div>
          <div style={{ fontWeight: videoOrientation === 'landscape' ? 'bold' : 'normal', fontSize: '0.9rem' }}>横版视频</div>
        </div>
        <div 
          onClick={() => setVideoOrientation('portrait')}
          style={{
            flex: '1',
            padding: '12px 8px',
            border: `2px solid ${videoOrientation === 'portrait' ? '#6B66FF' : '#e2e8f0'}`,
            borderRadius: '8px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: videoOrientation === 'portrait' ? 'rgba(107, 102, 255, 0.05)' : 'white'
          }}
        >
          <div style={{ 
            width: '40px', 
            height: '60px', 
            backgroundColor: '#e2e8f0',
            borderRadius: '4px',
            marginBottom: '8px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#718096',
            fontSize: '0.8rem'
          }}>9:16</div>
          <div style={{ fontWeight: videoOrientation === 'portrait' ? 'bold' : 'normal', fontSize: '0.9rem' }}>竖版</div>
        </div>
        <div 
          onClick={() => setVideoOrientation('landscape43')}
          style={{
            flex: '1',
            padding: '12px 8px',
            border: `2px solid ${videoOrientation === 'landscape43' ? '#6B66FF' : '#e2e8f0'}`,
            borderRadius: '8px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: videoOrientation === 'landscape43' ? 'rgba(107, 102, 255, 0.05)' : 'white'
          }}
        >
          <div style={{ 
            width: '54px', 
            height: '40px', 
            backgroundColor: '#e2e8f0',
            borderRadius: '4px',
            marginBottom: '8px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#718096',
            fontSize: '0.8rem'
          }}>4:3</div>
          <div style={{ fontWeight: videoOrientation === 'landscape43' ? 'bold' : 'normal', fontSize: '0.9rem' }}>4:3 横版</div>
        </div>
        <div 
          onClick={() => setVideoOrientation('square')}
          style={{
            flex: '1',
            padding: '12px 8px',
            border: `2px solid ${videoOrientation === 'square' ? '#6B66FF' : '#e2e8f0'}`,
            borderRadius: '8px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: videoOrientation === 'square' ? 'rgba(107, 102, 255, 0.05)' : 'white'
          }}
        >
          <div style={{ 
            width: '40px', 
            height: '40px', 
            backgroundColor: '#e2e8f0',
            borderRadius: '4px',
            marginBottom: '8px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#718096',
            fontSize: '0.8rem'
          }}>1:1</div>
          <div style={{ fontWeight: videoOrientation === 'square' ? 'bold' : 'normal', fontSize: '0.9rem' }}>正方形</div>
        </div>
      </div>
    </div>
  );
};

export default VideoOrientationSelector;
