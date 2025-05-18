import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { apiBase } from '../../utils';

const BottomPlayerContext = createContext();

export const useBottomPlayer = () => {
  const context = useContext(BottomPlayerContext);
  if (!context) {
    throw new Error('useBottomPlayer must be used within a BottomPlayerProvider');
  }
  return context;
};

export const BottomPlayerProvider = ({ children }) => {
  const audioRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isError, setIsError] = useState(false);
  const [volume, setVolume] = useState(1);
  const [songInfo, setSongInfo] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const play = (url, songData) => {
    console.log('播放音频', url, songData);
    if (url && url !== audioUrl) {
      setAudioUrl(url);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
      }
    }
    if (songData) {
      setSongInfo(songData);
    }
    
    // 确保音频元素存在并尝试播放
    if (audioRef.current) {
      const playPromise = audioRef.current.play();
      
      // 处理播放Promise
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('音频播放成功');
            setIsPlaying(true);
          })
          .catch(error => {
            console.error('音频播放失败:', error);
            // 可能是由于用户交互限制导致的播放失败
            // 在某些浏览器中，需要用户交互才能自动播放音频
            setIsError(true);
          });
      }
    } else {
      console.error('音频元素不存在');
    }
  };

  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play(audioUrl);
    }
  };

  const updateProgress = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setProgress((currentTime / duration) * 100);
    }
  };

  const seekTo = (percent) => {
    if (audioRef.current) {
      const duration = audioRef.current.duration;
      audioRef.current.currentTime = (percent / 100) * duration;
    }
  };

  const setAudioVolume = (value) => {
    if (audioRef.current) {
      audioRef.current.volume = value;
      setVolume(value);
    }
  };

  const handleError = () => {
    console.log('音频加载失败，尝试播放下一首');
    setIsError(false); // 不设置错误状态，避免显示错误提示
    
    // 如果有播放列表，尝试播放下一首
    if (playlist.length > 1) {
      setTimeout(() => {
        playNext();
      }, 500); // 等待短暂停后再尝试播放下一首
    } else {
      setIsPlaying(false);
    }
  };

  // 添加歌曲到播放列表
  const addToPlaylist = (songs) => {
    setPlaylist(songs);
  };

  // 播放播放列表中的指定索引歌曲
  const playFromPlaylist = (index) => {
    if (playlist.length > 0 && index >= 0 && index < playlist.length) {
      const song = playlist[index];
      
      console.log(`播放列表歌曲: ${index}`, song);
      
      // 获取歌曲ID
      const songId = song._id;
      
      // 先设置当前索引
      setCurrentIndex(index);
      setSongInfo(song);
      
      // 使用歌曲ID获取详细信息并播放
      fetch(`${apiBase}/song/${songId}`)
        .then(response => response.json())
        .then(data => {
          if (data && data.length > 0) {
            const songDetail = data[0];
            console.log('获取到歌曲详情:', songDetail);
            
            // 构建音频URL
            const url = songDetail.url ? `${apiBase}/audio/${songDetail.url.replace("uploads/", "")}` : '';
            console.log('播放音频URL:', url);
            
            if (url) {
              // 直接设置音频元素属性并播放
              if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.load();
                const playPromise = audioRef.current.play();
                
                if (playPromise !== undefined) {
                  playPromise
                    .then(() => {
                      console.log('播放列表歌曲成功:', index);
                      setAudioUrl(url);
                      setIsPlaying(true);
                    })
                    .catch(error => {
                      console.error('播放列表歌曲失败:', error);
                      setIsError(true);
                    });
                }
              } else {
                console.error('音频元素不存在');
              }
            } else {
              console.error('歌曲没有可用的URL:', songDetail);
              setIsError(true);
            }
          } else {
            console.error('获取歌曲详情失败');
            setIsError(true);
          }
        })
        .catch(error => {
          console.error('获取歌曲详情出错:', error);
          setIsError(true);
        });
    } else {
      console.error('无效的播放列表索引:', index, '播放列表长度:', playlist.length);
    }
  };

  // 播放下一首
  const playNext = () => {
    if (playlist.length > 0) {
      const nextIndex = (currentIndex + 1) % playlist.length;
      playFromPlaylist(nextIndex);
    }
  };

  // 播放上一首
  const playPrevious = () => {
    if (playlist.length > 0) {
      const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
      playFromPlaylist(prevIndex);
    }
  };

  // 处理音频播放结束事件
  const handleEnded = () => {
    if (playlist.length > 0) {
      console.log('歌曲播放结束，自动播放下一首');
      playNext();
    } else {
      setIsPlaying(false);
    }
  };
  
  // 监听音频播放结束，自动播放下一首
  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      // 移除之前可能存在的监听器，避免重复
      audioElement.removeEventListener('ended', handleEnded);
      // 添加新的监听器
      audioElement.addEventListener('ended', handleEnded);
    }
    
    return () => {
      if (audioElement) {
        audioElement.removeEventListener('ended', handleEnded);
      }
    };
  }, [currentIndex, playlist.length]);

  const value = {
    audioRef,
    audioUrl,
    isPlaying,
    progress,
    isError,
    volume,
    songInfo,
    playlist,
    currentIndex,
    play,
    pause,
    togglePlay,
    seekTo,
    setAudioVolume,
    addToPlaylist,
    playFromPlaylist,
    playNext,
    playPrevious
  };

  return (
    <BottomPlayerContext.Provider value={value}>
      <audio
        ref={audioRef}
        onTimeUpdate={updateProgress}
        onEnded={handleEnded}
        onError={handleError}
        preload="auto"
      />
      {children}
    </BottomPlayerContext.Provider>
  );
};