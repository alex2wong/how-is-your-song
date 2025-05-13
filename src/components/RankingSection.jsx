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
      <div 
          className={`event-tag ${activeRankTab === 'xiyouji' ? 'active' : ''}`}
          onClick={() => setActiveRankTab('xiyouji')}
          style={{
            display: 'inline-block',
            marginTop: '0px',
            marginBottom: '10px',
            padding: '6px 12px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            background: activeRankTab === 'xiyouji' 
              ? 'linear-gradient(45deg, #FF6B66, #6B66FF)' 
              : 'linear-gradient(45deg, #FF6B66, #9966FF)',
            color: '#fff',
            border: activeRankTab === 'xiyouji' 
              ? '1px solid #6B66FF' 
              : '0px solid #9966FF',
            boxShadow: '0 2px 10px rgba(107, 102, 255, 0.3)',
            transition: 'all 0.3s ease',
            animation: activeRankTab === 'xiyouji' ? 'pulse 1.5s infinite' : 'none',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <span style={{
            position: 'relative',
            zIndex: 2,
            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
          }}>
            AI音乐达人《西游记》共创盛典
          </span>
          {activeRankTab !== 'xiyouji' && (
            <span style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, rgba(255,107,102,0.3), rgba(153,102,255,0.3))',
              zIndex: 1,
              transform: 'translateX(-100%)',
              animation: 'shimmer 2s infinite'
            }}></span>
          )}
        </div>
        <style jsx>{`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      
      <div className="ranking-tabs">
        {[
          // { id: '24hours', name: '24小时榜' },
          { id: '48hours', name: '48小时榜' },
          { id: 'weekly', name: '周榜' },
          { id: 'monthly', name: '月榜' },
          { id: 'total', name: '总榜' },
          { id: 'like', name: '点赞榜' },
          { id: 'pop', name: '流行榜' },
          { id: 'electronic', name: '电子榜' },
          { id: 'rock', name: '摇滚榜' },
          { id: 'symphony', name: '交响乐榜' },
          { id: 'jazz', name: '爵士乐榜' },
          { id: 'folk', name: '民谣榜' },
          { id: 'rap', name: '说唱榜' },
          { id: 'rnb', name: 'R&B榜' },
          { id: 'instrumental', name: '纯音乐榜' },
          { id: 'chinese', name: '国风榜' },
          { id: 'edm', name: 'EDM榜' },
          { id: 'classical', name: '古典榜' },
          { id: 'reggae', name: '雷鬼榜' },
          { id: 'metal', name: '金属榜' },
          { id: 'opera', name: '歌剧榜' },
          { id: 'mylike', name: '我点赞的歌'},
          { id: 'worst', name: '低分榜' },
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
              <div className="song-title" style={{ textAlign: 'left' }}>{song.song_name.replace(/\.[^/.]+$/, "")}</div>
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
