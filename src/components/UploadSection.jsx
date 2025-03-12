import React from 'react';
import { RiUploadCloud2Line, RiMusicLine, RiMusic2Line } from 'react-icons/ri';

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
    <section className="upload-section">
      <div className="upload-header">
        <h2>音乐智能分析系统</h2>
      </div>
      
      <div 
        className="file-upload animated-icon"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current.click()}
      >
        <RiUploadCloud2Line style={{ fontSize: '3rem', marginBottom: '16px', color: '#6B66FF' }} />
        <h3>选择音频文件</h3>
        <p>支持 MP3、WAV 和 MP4 等格式</p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,audio/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
      
      {file && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '12px', 
          backgroundColor: 'rgba(107, 102, 255, 0.05)', 
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <RiMusicLine style={{ fontSize: '1.5rem', color: '#6B66FF', marginRight: '12px' }} />
          <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <div style={{ fontWeight: 'bold' }}>{file.name}</div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
          </div>
        </div>
      )}
      
      {audioUrl && (
        <audio 
          src={audioUrl} 
          controls 
          className="audio-player"
          style={{ 
            width: '100%', 
            marginBottom: '16px',
            borderRadius: '8px' 
          }}
        >
        </audio>
      )}
      
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="请填写音乐署名或作者名，如果不填默认匿名 (例如：周杰伦、方文山)"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          style={{
            padding: '12px 16px',
            width: '100%',
            borderRadius: 'var(--border-radius)',
            border: '1px solid #d1d5db',
            fontSize: '0.9rem',
            outline: 'none',
            transition: 'all 0.3s ease'
          }}
        />
      </div>
      
      <div className="privacy-mode">
        <input
          type="checkbox"
          id="privacy-mode"
          checked={privacyMode}
          onChange={(e) => setPrivacyMode(e.target.checked)}
        />
        <label htmlFor="privacy-mode">隐私模式</label>
        <span className="privacy-mode-text">
          不参与排行，不可检索，不可分享，服务器不保存任何数据，建议使用自定义 API KEY
        </span>
      </div>

      <button 
        className="analyze-button"
        onClick={handleUpload}
        disabled={!file || loading}
        style={{
          background: 'var(--secondary-gradient)',
          color: 'white',
          border: 'none',
          padding: '14px 32px',
          borderRadius: 'var(--border-radius)',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          boxShadow: '0 6px 16px rgba(59, 130, 246, 0.2)',
          transition: 'all 0.3s ease',
          marginTop: '20px'
        }}
      >
        <RiMusic2Line style={{ fontSize: '1.2rem' }} />
        {loading ? '分析中...' : '开始分析'}
      </button>

      {loading && (
        <div style={{ marginTop: '1rem', width: '100%' }}>
          <div style={{ 
            width: '100%', 
            height: '6px', 
            backgroundColor: 'rgba(107, 102, 255, 0.1)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${uploadProgress}%`,
              height: '100%',
              background: 'var(--primary-gradient)',
              transition: 'width 0.3s ease-in-out'
            }} />
          </div>
          <div style={{ 
            textAlign: 'center', 
            marginTop: '0.5rem',
            fontSize: '0.9rem',
            color: '#4A5568'
          }}>
            上传进度：{uploadProgress}%
          </div>
        </div>
      )}
    </section>
  );
};

export default UploadSection;
