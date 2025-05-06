import React from 'react';

/**
 * 歌曲信息输入组件
 */
const SongInfoInput = ({ 
  songTitle, 
  setSongTitle, 
  authorName, 
  setAuthorName 
}) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', color: '#4A5568' }}>2. 输入歌曲信息</h3>
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#4A5568' }}>歌曲标题</label>
          <input 
            type="text" 
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            placeholder="请输入歌曲标题"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '1rem'
            }}
          />
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#4A5568' }}>作者名称（副标题）</label>
          <input 
            type="text" 
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="请输入作者名称"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '1rem'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SongInfoInput;
