import React from 'react';

const UploadSection = ({ 
  file, 
  audioUrl, 
  loading, 
  uploadProgress, 
  authorName, 
  privacyMode, 
  fileInputRef,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  handleFileChange,
  handleUpload,
  setAuthorName,
  setPrivacyMode
}) => {
  return (
    <div 
      className="upload-section"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,audio/*"
        onChange={handleFileChange}
      />
      {audioUrl && (
        <audio src={audioUrl} controls className="audio-player">
        </audio>
      )}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        style={{
          marginLeft: 'auto',
          display: 'block'
        }}
      >
        {loading ? '分析中...' : '开始分析'}
      </button>
      <input
        type="text"
        placeholder="请填写音乐署名或作者名，如果不填默认匿名 (例如：周杰伦、方文山)"
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        style={{
          marginTop: '1rem',
          padding: '0.5rem',
          width: '100%',
          borderRadius: '4px',
          border: '1px solid #ddd'
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
        <input
          type="checkbox"
          id="privacyMode"
          checked={privacyMode}
          onChange={(e) => setPrivacyMode(e.target.checked)}
          style={{ marginRight: '0.5rem' }}
        />
        <label htmlFor="privacyMode" style={{ flexShrink: 0 }}>隐私模式</label>
        <span style={{ 
          marginLeft: '8px', 
          color: '#999', 
          fontSize: '12px'
        }}>
          不参与排行，不可搜索，不可分享，服务器不保存任何数据，建议使用自定义APIKEY
        </span>
      </div>

      {loading && (
        <div style={{ marginTop: '1rem', width: '100%' }}>
          <div style={{ 
            width: '100%', 
            height: '4px', 
            backgroundColor: '#eee',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${uploadProgress}%`,
              height: '100%',
              backgroundColor: '#4CAF50',
              transition: 'width 0.3s ease-in-out'
            }} />
          </div>
          <div style={{ 
            textAlign: 'center', 
            marginTop: '0.5rem',
            fontSize: '0.9rem',
            color: '#666'
          }}>
            上传进度：{uploadProgress}%
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadSection;
