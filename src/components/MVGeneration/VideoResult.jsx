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
  
  // 处理下载MV的函数
  const handleDownloadMV = () => {
    if (!generatedMV || !generatedMV.blob) return;
    
    // 创建文件名
    const fileName = `${songTitle || '未命名'}_${authorName || '未知'}_MV.mp4`;
    
    // 创建一个新的Blob对象，确保设置正确的MIME类型
    const videoBlob = new Blob([generatedMV.blob], { type: 'video/mp4' });
    
    // 创建下载链接
    const url = URL.createObjectURL(videoBlob);
    
    // 创建一个临时的a标签用于下载
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };
  
  // 生成显示的文件名
  const displayName = `${songTitle || '未命名'}_${authorName || '未知'}_MV.mp4`;
  
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
          <div style={{ fontWeight: 'bold' }}>{displayName}</div>
          <div style={{ fontSize: '0.8rem', color: '#718096' }}>
            {videoOrientation === 'landscape' ? '横版 16:9' : videoOrientation === 'landscape43' ? '4:3 横版' : videoOrientation === 'square' ? '正方形' : '竖版 9:16'} • {songTitle} • {authorName}
          </div>
        </div>
        <button 
          onClick={handleDownloadMV}
          style={{
            backgroundColor: '#6B66FF',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            padding: '8px 16px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <RiArrowDownSLine /> 下载MV
        </button>
      </div>
    </div>
  );
};

export default VideoResult;
