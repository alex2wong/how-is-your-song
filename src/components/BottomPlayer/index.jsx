import React, { useState } from 'react';
import { useBottomPlayer } from './BottomPlayerContext';
import { RiPlayFill, RiPauseFill, RiVolumeMuteFill, RiVolumeUpFill, RiSkipBackFill, RiSkipForwardFill, RiPlayListFill } from 'react-icons/ri'
import { scoreClassStyles } from '../../utils';

const BottomPlayer = () => {
  const {
    isPlaying,
    progress,
    isError,
    volume,
    togglePlay,
    seekTo,
    setAudioVolume,
    audioRef,
    songInfo,
    playlist,
    currentIndex,
    playNext,
    playPrevious,
    playFromPlaylist
  } = useBottomPlayer();

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const [currentSpeed, setCurrentSpeed] = useState(1);

  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget;
    const clickX = e.nativeEvent.offsetX;
    const width = progressBar.clientWidth;
    seekTo((clickX / width) * 100);
  };

  const handleVolumeChange = (e) => {
    setAudioVolume(parseFloat(e.target.value));
  };

  const handleSpeedChange = (speed) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
      setCurrentSpeed(speed);
      setShowSpeedMenu(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = audioRef.current ? audioRef.current.currentTime : 0;
  const duration = audioRef.current ? audioRef.current.duration : 0;

  // 移除错误显示，即使发生错误也显示正常播放界面
  // 错误处理逻辑已移至BottomPlayerContext.jsx中的handleError函数

  // 获取歌曲名称（如果有）
  const getSongName = () => {
    if (!songInfo) return null;
    const songName = songInfo.song_name || '';
    return typeof songName === 'string' ? songName.replace(/\.[^/.]+$/, "") : ''; // 移除文件扩展名
  };

  // 获取作者名称（如果有）
  const getAuthorName = () => {
    if (!songInfo) return null;
    return songInfo.authorName || '';
  };

  // 获取评分（如果有）
  const getScore = () => {
    if (!songInfo || !songInfo.overall_score) return null;
    return songInfo.overall_score;
  };

  return (
    <div className="bottom-player" style={{
      position: 'fixed',
      bottom: 0,
      left: 40,
      right: 40,
      backgroundColor: '#fff',
      borderTop: '1px solid #eee',
      padding: '12px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      borderRadius: '8px',
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
      zIndex: 1000
    }}>
      {/* 歌曲信息区域 */}
      {songInfo && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#666',
          marginBottom: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {getSongName() && (
              <span style={{ fontWeight: 'bold' }}>《{getSongName()}》</span>
            )}
            {getAuthorName() && (
              <span style={{ 
                padding: '2px 6px', 
                borderRadius: '4px', 
                backgroundColor: '#f0f0f0',
                fontSize: '10px'
              }}>
                {getAuthorName()}
              </span>
            )}
          </div>
          {getScore() !== null && (
            <span style={{ 
              padding: '2px 6px', 
              borderRadius: '4px', 
              backgroundColor: scoreClassStyles(getScore()).bgColor,
              color: '#fff',
              fontSize: '10px'
            }}>
              {getScore().toFixed(1)}分
            </span>
          )}
        </div>
      )}

      {/* 播放控制区域 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {playlist.length > 0 && (
          <button
            onClick={playPrevious}
            style={{
              cursor: 'pointer',
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              borderRadius: '50%',
              backgroundColor: 'rgba(107, 102, 255, 0.1)',
              color: '#6B66FF',
              transition: 'all 0.2s ease'
            }}
          >
            <RiSkipBackFill style={{ width: 16, height: 16, flexShrink: 0 }} color="#6B66FF" />
          </button>
        )}
        <button
          onClick={togglePlay}
          style={{
            cursor: 'pointer',
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            borderRadius: '50%',
            backgroundColor: '#6B66FF',
            color: '#fff',
            transition: 'all 0.2s ease'
          }}
        >
          {isPlaying ? <RiPauseFill style={{ width: 20, height: 20, flexShrink: 0 }} color="#fff" /> : <RiPlayFill style={{ width: 20, height: 20, flexShrink: 0 }} color="#fff" />}
        </button>
        
        {playlist.length > 0 && (
          <button
            onClick={playNext}
            style={{
              cursor: 'pointer',
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              borderRadius: '50%',
              backgroundColor: 'rgba(107, 102, 255, 0.1)',
              color: '#6B66FF',
              transition: 'all 0.2s ease'
            }}
          >
            <RiSkipForwardFill style={{ width: 16, height: 16, flexShrink: 0 }} color="#6B66FF" />
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '12px' }}>
          {formatTime(currentTime)}
        </div>

        <div className="progress-container" style={{
          flex: 1,
          cursor: 'pointer',
        }}>
          <div
            className="progress-bar"
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: 'rgba(107, 102, 255, 0.1)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
            onClick={handleProgressClick}
          >
            <div
              className="progress"
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #6B66FF, #8A84FF)',
                transition: 'width 0.1s linear',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '12px' }}>
          {formatTime(duration)}
        </div>

        <div className="volume-control" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '120px',
        }}>
          {volume === 0 ? <RiVolumeMuteFill size={20} /> : <RiVolumeUpFill size={20} />}
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              accentColor: '#6B66FF'
            }}
          />
        </div>
        
        {playlist.length > 0 && (
          <div className="playlist-control" style={{ position: 'relative' }}>
            <button
              onClick={() => setShowPlaylist(!showPlaylist)}
              style={{
                cursor: 'pointer',
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                borderRadius: '50%',
                backgroundColor: showPlaylist ? '#6B66FF' : 'rgba(107, 102, 255, 0.1)',
                color: showPlaylist ? '#fff' : '#6B66FF',
                transition: 'all 0.2s ease'
              }}
            >
              <RiPlayListFill style={{ width: 16, height: 16, flexShrink: 0 }} color={showPlaylist ? '#fff' : '#6B66FF'} />
            </button>
            
            {showPlaylist && (
              <div 
                style={{
                  position: 'absolute',
                  bottom: '40px',
                  right: 0,
                  width: '300px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
                  zIndex: 1001,
                  padding: '12px'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '12px',
                  borderBottom: '1px solid #eee',
                  paddingBottom: '8px'
                }}>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>播放列表 ({playlist.length}首)</h3>
                  <button 
                    onClick={() => setShowPlaylist(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '18px',
                      cursor: 'pointer',
                      color: '#666'
                    }}
                  >
                    ×
                  </button>
                </div>
                
                <div>
                  {playlist.map((song, index) => (
                    <div 
                      key={index}
                      onClick={() => currentIndex !== index && playFromPlaylist(index)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        backgroundColor: currentIndex === index ? 'rgba(107, 102, 255, 0.1)' : 'transparent',
                        marginBottom: '4px',
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        backgroundColor: currentIndex === index ? '#6B66FF' : '#eee',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '8px'
                      }}>
                        {currentIndex === index && isPlaying ? 
                          <RiPauseFill style={{ width: 14, height: 14 }} color="#fff" /> : 
                          <RiPlayFill style={{ width: 14, height: 14 }} color={currentIndex === index ? '#fff' : '#666'} />}
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ 
                          fontWeight: currentIndex === index ? 'bold' : 'normal',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: '14px'
                        }}>
                          {song.song_name ? song.song_name.replace(/\.[^/.]+$/, "") : ''}
                        </div>
                        {song.authorName && (
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#666',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {song.authorName}
                          </div>
                        )}
                      </div>
                      <div style={{ 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        backgroundColor: scoreClassStyles(song.overall_score).bgColor,
                        color: '#fff',
                        fontSize: '10px',
                        marginLeft: '8px'
                      }}>
                        {song.overall_score.toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BottomPlayer;