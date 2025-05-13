import React, { useState } from 'react';
import { RiUploadCloud2Line, RiMusicLine, RiMusic2Line, RiCloseLine, RiFileUploadLine, RiAwardLine } from 'react-icons/ri';

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
  setPrivacyMode,
  setFile,
  setAudioUrl,
  eventTag,
  setEventTag
}) => {
  // 添加清除文件的函数
  const handleClearFile = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setFile(null);
    setAudioUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section className="upload-section">
      <div className="upload-header">
        <h2>音乐智能分析系统</h2>
      </div>
      
      {!file && (
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
      )}
      
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
          <button 
            onClick={handleClearFile}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '50%',
              color: '#6B66FF',
              transition: 'all 0.2s ease'
            }}
            title="清除文件"
          >
            <RiCloseLine style={{ fontSize: '1.5rem' }} />
          </button>
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
        <label htmlFor="privacy-mode" style={{ flexShrink: 0}}>隐私模式</label>
        <span className="privacy-mode-text" style={{ textAlign: 'left'}}>
          不参与排行，不可检索，不可分享，服务器不保存任何数据，建议使用自定义 API KEY
        </span>
      </div>
      
      <div className="event-selection" style={{ 
        marginBottom: '16px',
        marginTop: '16px',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(240,240,255,0.8) 100%)',
        padding: '10px 15px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(107, 102, 255, 0.1)',
        border: '1px solid rgba(107, 102, 255, 0.2)'
      }}>
        <RiAwardLine style={{ 
          fontSize: '1.5rem', 
          color: '#FF6B66', 
          marginRight: '12px',
          filter: 'drop-shadow(0 0 2px rgba(255, 107, 102, 0.3))'
        }} />
        <label htmlFor="event-select" style={{ 
          fontWeight: 'bold', 
          marginRight: '10px',
          color: '#444',
          flexShrink: 0
        }}>
          参与活动：
        </label>
        <select 
          id="event-select"
          value={eventTag}
          onChange={(e) => setEventTag(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 'var(--border-radius)',
            border: '1px solid #d1d5db',
            fontSize: '0.9rem',
            outline: 'none',
            transition: 'all 0.3s ease',
            background: 'linear-gradient(to right, #fff, #f8f8ff)',
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.7rem top 50%',
            backgroundSize: '0.65rem auto',
            paddingRight: '2rem'
          }}
        >
          <option value="">不参加活动</option>
          <option value="xiyouji" style={{ 
            background: 'linear-gradient(45deg, #FFD700, #FFA500)', 
            fontWeight: 'bold',
            color: '#8B4513'
          }}>AI音乐达人《西游记》共创盛典</option>
        </select>
      </div>

      <button 
        className="analyze-button"
        onClick={handleUpload}
        disabled={!file || loading}
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
