import React from 'react';
import { FaThumbsUp } from 'react-icons/fa';
import { scoreClassStyles, getAuthorNameColor } from '../utils';

const SearchSection = ({ 
  searchQuery, 
  searchResults, 
  searchLoading, 
  handleInputChange, 
  fetchSongDetail 
}) => {
  return (
    <div style={{
      margin: '20px 0',
      padding: '20px',
      border: '1px solid #eee',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      justifyItems: 'center',
      borderRadius: '8px' 
    }}>
      {/* 搜索框 */}
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="搜索歌曲..."
          style={{
            width: '95%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      </div>

      {/* 搜索结果 */}
      {searchLoading && (
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
      
      {!searchLoading && searchResults.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '18px 0 8px', color: '#666' }}>搜索结果</h4>
          <div style={{ 
            maxHeight: '300px', 
            overflowY: 'auto',
            border: '1px solid #eee',
            borderRadius: '4px'
          }}>
            {searchResults.map((song, index) => (
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
        </div>
      )}
    </div>
  );
};

export default SearchSection;
