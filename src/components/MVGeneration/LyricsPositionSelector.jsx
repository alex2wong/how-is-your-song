import React from 'react';

/**
 * 歌词显示位置选择组件
 */
const LyricsPositionSelector = ({ lyricsPosition, setLyricsPosition }) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', color: '#4A5568' }}>6. 歌词显示位置</h3>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
        <div 
          onClick={() => setLyricsPosition('left')}
          style={{
            flex: '1',
            padding: '12px 8px',
            border: `2px solid ${lyricsPosition === 'left' ? '#6B66FF' : '#e2e8f0'}`,
            borderRadius: '8px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: lyricsPosition === 'left' ? 'rgba(107, 102, 255, 0.05)' : 'white'
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
          }}>左侧</div>
          <div style={{ fontWeight: lyricsPosition === 'left' ? 'bold' : 'normal', fontSize: '0.9rem' }}>歌词显示在左侧</div>
        </div>
        <div 
          onClick={() => setLyricsPosition('right')}
          style={{
            flex: '1',
            padding: '12px 8px',
            border: `2px solid ${lyricsPosition === 'right' ? '#6B66FF' : '#e2e8f0'}`,
            borderRadius: '8px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: lyricsPosition === 'right' ? 'rgba(107, 102, 255, 0.05)' : 'white'
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
          }}>右侧</div>
          <div style={{ fontWeight: lyricsPosition === 'right' ? 'bold' : 'normal', fontSize: '0.9rem' }}>歌词显示在右侧</div>
        </div>
        <div 
          onClick={() => setLyricsPosition('center')}
          style={{
            flex: '1',
            padding: '12px 8px',
            border: `2px solid ${lyricsPosition === 'center' ? '#6B66FF' : '#e2e8f0'}`,
            borderRadius: '8px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: lyricsPosition === 'center' ? 'rgba(107, 102, 255, 0.05)' : 'white'
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
          }}>居中</div>
          <div style={{ fontWeight: lyricsPosition === 'center' ? 'bold' : 'normal', fontSize: '0.9rem' }}>歌词居中显示</div>
        </div>
        <div 
          onClick={() => setLyricsPosition('bottom')}
          style={{
            flex: '1',
            padding: '12px 8px',
            border: `2px solid ${lyricsPosition === 'bottom' ? '#6B66FF' : '#e2e8f0'}`,
            borderRadius: '8px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: lyricsPosition === 'bottom' ? 'rgba(107, 102, 255, 0.05)' : 'white'
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
          }}>底部</div>
          <div style={{ fontWeight: lyricsPosition === 'bottom' ? 'bold' : 'normal', fontSize: '0.9rem' }}>歌词显示在底部</div>
        </div>
      </div>
    </div>
  );
};

export default LyricsPositionSelector;
