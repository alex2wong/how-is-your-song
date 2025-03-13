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
    <section className="ranking-section">
      <div className="ranking-header">
        <h2>最受 AI 喜爱的歌曲</h2>
      </div>
      
      <div className="ranking-tabs">
        {[
          { id: '24hours', name: '24小时榜' },
          { id: '48hours', name: '48小时榜' },
          { id: 'monthly', name: '月榜' },
          { id: 'pop', name: '流行榜' },
          { id: 'electronic', name: '电子榜' },
          { id: 'symphony', name: '交响乐榜' },
          { id: 'jazz', name: '爵士乐榜' },
          { id: 'folk', name: '民谣榜' },
          { id: 'rap', name: '说唱榜' },
          { id: 'rnb', name: 'R&B榜' },
          { id: 'instrumental', name: '纯音乐榜' },
          { id: 'chinese', name: '国风榜' },
          { id: 'edm', name: 'EDM榜' },
          { id: 'classical', name: '古典榜' },
          { id: 'worst', name: '低分榜' },
          // Keeping these tabs but they're not in the new design
          { id: 'weekly', name: '周榜' },
          { id: 'total', name: '总榜' },
          { id: 'rock', name: '摇滚榜' },
          { id: 'reggae', name: '雷鸿榜' },
          { id: 'metal', name: '金属榜' },
          { id: 'opera', name: '歌剧榜' },
          { id: 'like', name: '点赞榜' },
          { id: 'mylike', name: '我点赞的歌'},
        ].map(tab => (
          <div
            key={tab.id}
            className={`ranking-tab ${activeRankTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveRankTab(tab.id)}
          >
            {tab.name}
          </div>
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
            borderTop: '3px solid #6B66FF', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite' 
          }}></div>
        </div>
      )}
      
      <div className="song-list">
        {!rankLoading && rankList.map((song, index) => (
          <div 
            key={index} 
            className="song-card"
            onClick={() => fetchSongDetail(song._id)}
          >
            <div className="song-rank">#{index + 1}</div>
            <div className="song-info" style={{ textAlign: 'left' }}>
              <div className="song-title" style={{ textAlign: 'left' }}>{song.song_name}</div>
              {song.authorName && (
                <span 
                  className="song-category" 
                  style={{ 
                    textAlign: 'left',
                    backgroundColor: getAuthorNameColor(song.authorName).bgColor,
                    color: getAuthorNameColor(song.authorName).textColor,
                    border: `1px solid ${getAuthorNameColor(song.authorName).borderColor}`
                  }}
                >
                  {song.authorName}
                </span>
              )}
            </div>
            {song.likes > 0 && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginRight: '15px',
                color: '#666', 
                fontSize: '0.9em' 
              }}>
                <FaThumbsUp 
                  style={{ 
                    width: '16px', 
                    height: '16px', 
                    flexShrink: 0, 
                    cursor: 'pointer', 
                    color: '#FF0000', 
                    marginRight: '8px'
                  }} 
                /> {song.likes}
              </div>
            )}
            <div className="song-score">{song.overall_score.toFixed(1)}分</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RankingSection;
