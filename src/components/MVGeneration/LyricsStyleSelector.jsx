import React from 'react';

/**
 * 歌词显示风格选择组件
 */
const LyricsStyleSelector = ({ 
  lyricsMaskStyle, 
  setLyricsMaskStyle, 
  lyricsStrokeStyle, 
  setLyricsStrokeStyle 
}) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', color: '#4A5568' }}>7. 歌词显示风格</h3>
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* 遮罩选项组 */}
        <div style={{ flex: 1, display: 'flex', gap: '10px' }}>
          <div 
            onClick={() => setLyricsMaskStyle('mask')}
            style={{
              flex: '1',
              padding: '12px 8px',
              border: `2px solid ${lyricsMaskStyle === 'mask' ? '#6B66FF' : '#e2e8f0'}`,
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: lyricsMaskStyle === 'mask' ? 'rgba(107, 102, 255, 0.05)' : 'white'
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
            }}>遮罩</div>
            <div style={{ fontWeight: lyricsMaskStyle === 'mask' ? 'bold' : 'normal', fontSize: '0.9rem' }}>有遮罩</div>
          </div>
          <div 
            onClick={() => setLyricsMaskStyle('noMask')}
            style={{
              flex: '1',
              padding: '12px 8px',
              border: `2px solid ${lyricsMaskStyle === 'noMask' ? '#6B66FF' : '#e2e8f0'}`,
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: lyricsMaskStyle === 'noMask' ? 'rgba(107, 102, 255, 0.05)' : 'white'
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
            }}>无遮罩</div>
            <div style={{ fontWeight: lyricsMaskStyle === 'noMask' ? 'bold' : 'normal', fontSize: '0.9rem' }}>无遮罩</div>
          </div>
        </div>
        
        {/* 描边选项组 */}
        <div style={{ flex: 1, display: 'flex', gap: '10px' }}>
          <div 
            onClick={() => setLyricsStrokeStyle('stroke')}
            style={{
              flex: '1',
              padding: '12px 8px',
              border: `2px solid ${lyricsStrokeStyle === 'stroke' ? '#6B66FF' : '#e2e8f0'}`,
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: lyricsStrokeStyle === 'stroke' ? 'rgba(107, 102, 255, 0.05)' : 'white'
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
            }}>描边</div>
            <div style={{ fontWeight: lyricsStrokeStyle === 'stroke' ? 'bold' : 'normal', fontSize: '0.9rem' }}>有描边</div>
          </div>
          <div 
            onClick={() => setLyricsStrokeStyle('noStroke')}
            style={{
              flex: '1',
              padding: '12px 8px',
              border: `2px solid ${lyricsStrokeStyle === 'noStroke' ? '#6B66FF' : '#e2e8f0'}`,
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: lyricsStrokeStyle === 'noStroke' ? 'rgba(107, 102, 255, 0.05)' : 'white'
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
            }}>无描边</div>
            <div style={{ fontWeight: lyricsStrokeStyle === 'noStroke' ? 'bold' : 'normal', fontSize: '0.9rem' }}>无描边</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LyricsStyleSelector;
