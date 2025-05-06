import React from 'react';
import { exampleLyrics } from './lyricsUtils';

/**
 * 歌词输入组件
 */
const LyricsInput = ({ lyrics, setLyrics }) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#4A5568' }}>5. 输入带时间戳的歌词</h3>
        <button 
          onClick={() => setLyrics(exampleLyrics)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#6B66FF',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}
        >
          填充示例
        </button>
      </div>
      <textarea
        value={lyrics}
        onChange={(e) => setLyrics(e.target.value)}
        placeholder="请按照以下格式输入歌词时间轴：
00:00.00
(Intro - Saxophone)
00:15.06
我很想要一个答案
..."
        style={{
          width: '100%',
          height: '200px',
          padding: '10px',
          borderRadius: '6px',
          border: '1px solid #e2e8f0',
          fontSize: '1rem',
          fontFamily: 'monospace',
          resize: 'vertical'
        }}
      ></textarea>
      <p style={{ fontSize: '0.9rem', color: '#718096', marginTop: '5px' }}>
        格式说明：每行时间戳（分:秒.毫秒）后面跟着对应的歌词内容。可直接将排行榜中歌曲评分后的歌词时间轴复制过来使用。
      </p>
    </div>
  );
};

export default LyricsInput;
