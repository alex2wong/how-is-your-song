import React from 'react';
import { RiArrowDownSLine } from 'react-icons/ri';

/**
 * 视频结果预览组件
 */
const VideoResult = ({ 
  generatedMV, 
  videoOrientation, 
  songTitle, 
  authorName 
}) => {
  if (!generatedMV) return null;
  
  return (
    <div style={{ marginTop: '20px' }}>
      <h3 style={{ marginBottom: '15px', fontSize: '1.1rem', color: '#4A5568' }}>生成结果</h3>
      <video 
        controls 
        style={{ 
          width: '100%', 
          borderRadius: '8px', 
          backgroundColor: '#000',
          aspectRatio: videoOrientation === 'landscape' ? '16/9' : videoOrientation === 'landscape43' ? '4/3' : videoOrientation === 'square' ? '1/1' : '9/16',
          maxHeight: '500px',
          margin: '0 auto',
          display: 'block'
        }}
        src={generatedMV.url}
      >
        您的浏览器不支持视频播放
      </video>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center', 
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px'
      }}>
        <div>
          <div style={{ fontWeight: 'bold' }}>{generatedMV.name}</div>
          <div style={{ fontSize: '0.8rem', color: '#718096' }}>
            {videoOrientation === 'landscape' ? '横版 16:9' : videoOrientation === 'landscape43' ? '4:3 横版' : videoOrientation === 'square' ? '正方形' : '竖版 9:16'} • {songTitle} • {authorName}
          </div>
        </div>
        <a 
          href={generatedMV.url} 
          download={generatedMV.name}
          style={{
            backgroundColor: '#6B66FF',
            color: 'white',
            textDecoration: 'none',
            fontWeight: 'bold',
            padding: '8px 16px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <RiArrowDownSLine /> 下载MV
        </a>
      </div>
    </div>
  );
};

export default VideoResult;
