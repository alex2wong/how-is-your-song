import React from 'react';
import { FaThumbsUp } from 'react-icons/fa';
import { scoreClassStyles, getAuthorNameColor } from '../utils';

const RankingSection = ({ 
  activeRankTab, 
  setActiveRankTab, 
  rankList, 
  rankLoading, 
  fetchSongDetail 
}) => {
  return (
    <div style={{
      margin: '20px 0',
      padding: '20px',
      border: '1px solid #eee',
      borderRadius: '8px'
    }}>
      <h3 style={{ margin: '0 0 16px', color: '#333' }}>最受AI喜爱的歌曲</h3>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[
          { id: '24hours', name: '24小时榜' },
          { id: '48hours', name: '48小时榜' },
          { id: 'weekly', name: '周榜' },
          { id: 'monthly', name: '月榜' },
          { id: 'total', name: '总榜' },
          { id: 'pop', name: '流行榜' },
          { id: 'rock', name: '摇滚榜' },
          { id: 'electronic', name: '电子榜' },
          { id: 'symphony', name: '交响乐榜' },
          { id: 'jazz', name: '爵士乐榜' },
          { id: 'folk', name: '民谣榜' },
          { id: 'reggae', name: '雷鬼榜' },
          { id: 'rap', name: '说唱榜' },
          { id: 'rnb', name: 'R&B榜' },
          { id: 'instrumental', name: '纯音乐榜' },
          { id: 'chinese', name: '国风榜' },
          // { id: 'blues', name: '布鲁斯榜' },
          { id: 'metal', name: '金属榜' },
          { id: 'edm', name: 'EDM榜' },
          { id: 'classical', name: '古典榜' },
          { id: 'opera', name: '歌剧榜' },
          { id: 'worst', name: '低分榜', style: { backgroundColor: '#ff4444', color: 'white' } },
          { id: 'like', name: '点赞榜' },
          { id: 'mylike', name: '我点赞的歌'},
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveRankTab(tab.id)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '20px',
              backgroundColor: activeRankTab === tab.id ? (tab.style?.backgroundColor || '#4CAF50') : '#f0f0f0',
              color: activeRankTab === tab.id ? (tab.style?.color || 'white') : '#666',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: activeRankTab === tab.id ? 'bold' : 'normal'
            }}
          >
            {tab.name}
          </button>
        ))}
      </div>
      
      {rankLoading && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '20px' 
        }}>
          <div style={{ 
            width: '30px', 
            height: '30px', 
            border: '3px solid #f3f3f3', 
            borderTop: '3px solid #4CAF50', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite' 
          }}></div>
        </div>
      )}
      
      {!rankLoading && rankList.map((song, index) => (
        <div 
          key={index} 
          onClick={() => fetchSongDetail(song._id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#f8f8f8',
            borderRadius: '6px',
            marginBottom: '8px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          <span style={{ fontWeight: 'bold', color: '#4CAF50', marginRight: '12px' }}>#{index + 1}</span>
          <span style={{ flex: 1, textAlign: 'left' }}>
            {song.song_name}
            {song.authorName && (
              <span style={{
                backgroundColor: getAuthorNameColor(song.authorName).bgColor,
                color: getAuthorNameColor(song.authorName).textColor,
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.85em',
                marginLeft: '8px',
                display: 'inline-block',
                verticalAlign: 'middle',
                border: `1px solid ${getAuthorNameColor(song.authorName).borderColor}`
              }}>
                {song.authorName}
              </span>
            )}
          </span>
          {song.likes > 0 && (
            <span style={{ marginRight: '24px', color: '#666', fontSize: '0.9em' }}>
              <FaThumbsUp 
                style={{ 
                  width: '16px', 
                  height: '16px', 
                  flexShrink: 0, 
                  cursor: 'pointer', 
                  color: '#FF0000', 
                  marginRight: '8px',
                  marginBottom: '-2px'
                }} 
              /> {song.likes}
            </span>
          )}
          <span style={{ fontWeight: 'bold', color: scoreClassStyles(song.overall_score).bgColor }}>{song.overall_score.toFixed(1)}分</span>
        </div>
      ))}
    </div>
  );
};

export default RankingSection;
