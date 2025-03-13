import React from 'react';
import { FaThumbsUp, FaSearch } from 'react-icons/fa';
import { scoreClassStyles, getAuthorNameColor } from '../utils';

const SearchSection = ({ 
  searchQuery, 
  searchResults, 
  searchLoading, 
  handleInputChange, 
  fetchSongDetail 
}) => {
  return (
    <section className="upload-section">
      <div className="upload-header">
        <h2>搜索歌曲</h2>
      </div>
      
      {/* 搜索框 */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        marginBottom: 'var(--spacing-md)'
      }}>
        <div style={{ 
          position: 'relative',
          width: '100%' 
        }}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="搜索歌曲..."
            style={{
              width: '100%',
              padding: '12px 16px 12px 42px',
              borderRadius: 'var(--border-radius)',
              border: '1px solid #d1d5db',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
          />
          <FaSearch style={{ 
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)'
          }} />
        </div>
      </div>

      {/* 搜索结果 */}
      {searchLoading && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: 'var(--spacing-lg)' 
        }}>
          <div style={{ 
            width: '30px', 
            height: '30px', 
            border: '3px solid #f3f3f3', 
            borderTop: '3px solid var(--primary)', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite' 
          }}></div>
        </div>
      )}
      
      {!searchLoading && searchResults.length > 0 && (
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <h4 style={{ 
            margin: '18px 0 8px', 
            color: 'var(--text-secondary)',
            textAlign: 'left'
          }}>搜索结果</h4>
          <div style={{ 
            maxHeight: '300px', 
            overflowY: 'auto',
            borderRadius: 'var(--radius-md)'
          }}>
            {searchResults.map((song, index) => (
              <div 
                key={index} 
                onClick={() => fetchSongDetail(song._id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(107, 102, 255, 0.05)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: 'var(--shadow-sm)'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span style={{ 
                  fontWeight: 'bold', 
                  color: 'var(--primary)', 
                  marginRight: '12px' 
                }}>#{index + 1}</span>
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
                  <span style={{ 
                    marginRight: '24px', 
                    color: 'var(--text-secondary)', 
                    fontSize: '0.9em',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <FaThumbsUp 
                      style={{ 
                        width: '16px', 
                        height: '16px', 
                        flexShrink: 0, 
                        color: '#FF0000', 
                        marginRight: '8px'
                      }} 
                    /> {song.likes}
                  </span>
                )}
                <span style={{ 
                  fontWeight: 'bold', 
                  backgroundColor: scoreClassStyles(song.overall_score).bgColor,
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.85em'
                }}>{song.overall_score.toFixed(1)}分</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default SearchSection;
