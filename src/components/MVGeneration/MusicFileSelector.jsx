import React from 'react';
import { RiMusic2Line, RiFileUploadLine } from 'react-icons/ri';
import { handleMusicFileChange, handleClearMusic } from './fileUtils';

/**
 * 音乐文件选择组件
 */
const MusicFileSelector = ({ 
  selectedMusic, 
  setSelectedMusic, 
  audioElement, 
  musicInputRef 
}) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', color: '#4A5568' }}>1. 选择音乐文件</h3>
      {!selectedMusic ? (
        <div 
          style={{
            border: '2px dashed #e2e8f0',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: '#f8fafc'
          }}
          onClick={() => musicInputRef.current.click()}
        >
          <RiMusic2Line style={{ fontSize: '2rem', color: '#6B66FF', marginBottom: '10px' }} />
          <p style={{ color: '#718096' }}>点击选择音乐文件（支持 MP3、WAV 格式）</p>
          <input
            ref={musicInputRef}
            type="file"
            accept=".mp3,.wav,audio/*"
            onChange={(e) => handleMusicFileChange(e, setSelectedMusic, audioElement)}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '12px', 
          backgroundColor: 'rgba(107, 102, 255, 0.05)', 
          borderRadius: '8px'
        }}>
          <RiMusic2Line style={{ fontSize: '1.5rem', color: '#6B66FF', marginRight: '12px' }} />
          <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <div style={{ fontWeight: 'bold' }}>{selectedMusic.name}</div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>
              {(selectedMusic.size / (1024 * 1024)).toFixed(2)} MB
            </div>
          </div>
          <button 
            onClick={() => handleClearMusic(audioElement, setSelectedMusic, musicInputRef)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#718096',
              fontSize: '1.2rem'
            }}
          >
            <RiFileUploadLine />
          </button>
        </div>
      )}
    </div>
  );
};

export default MusicFileSelector;
