import { FaShare, FaThumbsUp, FaRegThumbsUp, FaSpinner, FaCopy, FaVideo } from "react-icons/fa";
import { RiPlayFill, RiPauseFill } from "react-icons/ri";
import { apiBase, scoreClassStyles, getAuthorNameColor } from "../utils";
import { useBottomPlayer } from "./BottomPlayer/BottomPlayerContext";
import { copyShareLinkforSong } from "../utils";
import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "./ToastMessage/ToastContext";
import RadarChart from "./chart";

/**
 * 
 * .exellent {
    color: #4CAF50;
  }
  .good {
    color: #f7cb73;
  }
  .normal {
    color: #ff3c00;
  }
  
 */

export const SongDetail = ({ selectedSong, _scoreRender, onClose }) => {
  const { bgColor, classTxt } = scoreClassStyles(selectedSong.overall_score);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [songData, setSongData] = useState(selectedSong);
  const { play, pause, isPlaying, audioUrl } = useBottomPlayer();
  const songAudioUrl = `${apiBase}/audio/${selectedSong.url.replace('uploads/', '')}`;

  const { showToast } = useToast();

  // Check if the song is already liked on component mount
  useEffect(() => {
    const likedSongs = JSON.parse(localStorage.getItem('likedSongs') || '[]');
    setIsLiked(likedSongs.includes(selectedSong._id));
    setSongData(selectedSong);
  }, [selectedSong._id, selectedSong.likes]);

  // Toggle like status and update localStorage
  const handleLike = async () => {
    const likedSongs = JSON.parse(localStorage.getItem('likedSongs') || '[]');
    
    try {
      setIsLoading(true);
      
      if (isLiked) {
        // Remove from liked songs
        const updatedLikedSongs = likedSongs.filter(id => id !== selectedSong._id);
        localStorage.setItem('likedSongs', JSON.stringify(updatedLikedSongs));
        
        // Call the API to remove like using axios
        await axios.post(`${apiBase}/like/remove/${selectedSong._id}`);
        setSongData(prev => ({
          ...prev,
          likes: Math.max(0, (prev.likes || 0) - 1)
        }));
      } else {
        // Add to liked songs
        likedSongs.push(selectedSong._id);
        localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
        
        // Call the API to add like using axios
        await axios.post(`${apiBase}/like/add/${selectedSong._id}`);
        setSongData(prev => ({
          ...prev,
          likes: (prev.likes || 0) + 1
        }));
      }
      
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error updating like status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scoreRender = (rating) => {
    if (!rating) {
        return ''
      }
      const songName = rating.song_name.replace(/\.[^/.]+$/, "");
  
    return (<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{ 
      display: 'flex', 
      justifyContent: 'center',
      gap: '20px', 
      alignItems: 'center',
      marginBottom: '8px'
    }}>
      <h3 style={{ 
        margin: 0,
        background: 'var(--accent-gradient, linear-gradient(135deg, #FC466B, #3F5EFB))',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        textShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)'
      }}>{songName}</h3>
      <span style={{ 
        background: bgColor,
        color: 'white',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '14px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        {rating.overall_score}分
      </span>
      <span style={{ 
        color: bgColor,
        fontWeight: 'bold'
      }}>{classTxt}</span>
    </div>
    {rating.authorName && (
        <p>
        <span style={{
          background: getAuthorNameColor(rating.authorName).bgColor,
          color: getAuthorNameColor(rating.authorName).textColor,
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '0.85em',
          marginLeft: '8px',
          display: 'inline-block',
          verticalAlign: 'middle',
          border: `1px solid ${getAuthorNameColor(rating.authorName).borderColor}`,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          {rating.authorName}
        </span>
        </p>
      )}
    </div>)
    }

    const parseLyrics = (structureComment) => {
        if (!structureComment) return [];
        const matches = structureComment.match(/\[\d{2}:\d{2}\.\d{2}\].*?(?=\n|$)/g);
        if (!matches) return [];
        return matches.map(line => {
          const timeMatch = line.match(/\[(\d{2}):(\d{2}\.\d{2})\]/);
          const text = line.replace(/\[\d{2}:\d{2}\.\d{2}\]/, '').trim();
          if (timeMatch) {
            const minutes = parseInt(timeMatch[1]);
            const seconds = parseFloat(timeMatch[2]);
            const time = minutes * 60 + seconds;
            return { time, text };
          }
          return null;
        }).filter(item => item !== null);
      }

    const handleScroll = (e) => {
        // stop event propagation
        e.stopPropagation();
    }

    const handleClose = () => {
      onClose && onClose();
    }

    const handlePlayPause = () => {
      if (isPlaying && audioUrl === songAudioUrl) {
        pause();
      } else {
        play(songAudioUrl, songData);
      }
    };

    return (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.92))',
          padding: '0 24px 24px 24px',
          borderRadius: 'var(--radius-lg, 16px)',
          boxShadow: 'var(--shadow-lg, 0 8px 16px rgba(0, 0, 0, 0.1))',
          maxWidth: '90%',
          width: '800px',
          maxHeight: '90vh',
          overflow: 'auto',
          zIndex: 1000,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }} onScroll={handleScroll}>
          <div style={{ 
            position: 'sticky', 
            zIndex: 10, 
            top: 0, 
            padding: '24px 0', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '16px', 
            backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.92))',
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
          }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexDirection: 'row', width:'80vw' }}>
              <button
                onClick={handlePlayPause}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  borderRadius: '50%',
                  backgroundColor: '#6B66FF',
                  color: '#fff',
                  transition: 'all 0.2s ease',
                  minWidth: 36,
                  minHeight: 36,
                  padding: 0
                }}
              >
                {isPlaying && audioUrl === songAudioUrl ? (
                  <RiPauseFill style={{ width: 20, height: 20 }} color="#fff" />
                ) : (
                  <RiPlayFill style={{ width: 20, height: 20 }} color="#fff" />
                )}
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isLoading ? (
                <FaSpinner 
                  style={{ 
                    width: '24px', 
                    height: '24px', 
                    flexShrink: 0, 
                    color: 'var(--text-secondary, #4A5568)', 
                    marginRight: '4px',
                    animation: 'spin 1s linear infinite'
                  }} 
                />
              ) : isLiked ? (
                <FaThumbsUp 
                  style={{ 
                    width: '24px', 
                    height: '24px', 
                    flexShrink: 0, 
                    cursor: 'pointer', 
                    color: 'var(--error, #f44336)', 
                    marginRight: '4px',
                    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
                  }} 
                  onClick={handleLike} 
                />
              ) : (
                <FaRegThumbsUp 
                  style={{ 
                    width: '24px', 
                    height: '24px', 
                    flexShrink: 0, 
                    cursor: 'pointer', 
                    color: 'var(--text-secondary, #4A5568)', 
                    marginRight: '4px',
                    transition: 'all 0.2s ease'
                  }} 
                  onClick={handleLike} 
                />
              )}
              <span style={{ color: 'var(--text-secondary, #4A5568)', fontSize: '14px' }}>
                {songData.likes || 0}
              </span>
              <FaShare 
                style={{ 
                  width: '24px', 
                  height: '24px', 
                  flexShrink: 0, 
                  cursor: 'pointer', 
                  color: 'var(--text-secondary, #4A5568)', 
                  marginLeft: '8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'var(--primary, #4CAF50)'
                  }
                }} 
                onClick={() => {
                  copyShareLinkforSong(songData._id);
                  showToast('链接已复制到剪贴板');
                }} 
              />
              <button 
                onClick={handleClose}
                style={{
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-primary, #f8f9fa)',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  marginLeft: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: 'var(--shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.05))'
                }}
              >
                ×
              </button>
            </div>
          </div>
          <div style={{ marginTop: 50, marginBottom: '24px', display:'flex', flexDirection: 'column', alignItems: 'center' }}>
            {scoreRender(selectedSong)}
            <p className='summary-quote' style={{ fontSize: '16px', lineHeight: '1.6' }}>{selectedSong.comments}</p>
            <RadarChart data={selectedSong}></RadarChart>
          </div>
          <div 
            className="tags-container" 
            style={{ 
              position: 'relative',
              paddingRight: '40px', // 为复制按钮预留空间
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {selectedSong.tags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '16px',
                    backgroundColor: 'var(--bg-secondary, #f0f0f0)',
                    color: 'var(--text-secondary, #4A5568)',
                    fontSize: '14px'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <FaCopy 
              className="copy-icon"
              onClick={() => {
                const tagsString = selectedSong.tags.map(t=> t.replace('#', '')).join(', ');
                navigator.clipboard.writeText(tagsString);
                showToast('音乐标签已复制到剪贴板')
              }}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
                color: '#555',
                fontSize: '16px',
              }}
            />
          </div>

          <div className="comments" style={{ marginBottom: '24px' }}>
            <h3 style={{ borderBottom: '2px solid var(--primary, #4CAF50)', paddingBottom: '8px', marginBottom: '16px' }}>详细解析</h3>
            <div style={{ display: 'grid', gap: '20px' }}>
              {[
                { title: '编曲', data: selectedSong.arrangement },
                { title: '人声', data: selectedSong.vocal },
                { title: '结构', data: selectedSong.structure },
                { title: '歌词', data: selectedSong.lyrics }
              ].map(section => (
                <div key={section.title} style={{ 
                  padding: '16px', 
                  backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.92))',
                  borderRadius: 'var(--radius-md, 12px)',
                  border: '1px solid rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <h4 style={{ margin: 0 }}>{section.title}</h4>
                    <span style={{ 
                      backgroundColor: scoreClassStyles(section.data?.score).bgColor,
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '14px',
                    }}>
                      {section.data?.score}分
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', textAlign: 'left' }}>{section.data?.comments}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 歌词时间轴 */}
          {selectedSong.structure && selectedSong.structure.comments && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary, #4CAF50)', paddingBottom: '8px', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>歌词时间轴</h3>
                <button 
                  onClick={() => {
                    // 将歌词时间轴数据保存到localStorage
                    const fullText = selectedSong.structure.comments;
                    
                    // 提取纯歌词时间轴内容，去除前面的评论信息
                    // 查找第一个时间戳格式的行，如[00:00.00]或00:00.00
                    const timeStampRegex = /\[?\d{2}:\d{2}\.\d{2}\]?/;
                    const lines = fullText.split('\n');
                    
                    // 先提取所有的时间戳行
                    const timeStampLines = [];
                    
                    for (let i = 0; i < lines.length; i++) {
                      const line = lines[i].trim();
                      if (!line) continue;
                      
                      if (timeStampRegex.test(line)) {
                        // 提取时间戳和歌词
                        let timeStamp;
                        let lyricText = '';
                        
                        // 直接提取原始行，不做任何格式转换
                        timeStamp = line;
                        lyricText = '';
                        
                        // 检查下一行是否存在且不是时间戳行
                        if (i + 1 < lines.length && !timeStampRegex.test(lines[i + 1])) {
                          lyricText = lines[i + 1].trim();
                        }
                        
                        if (timeStamp) {
                          timeStampLines.push({
                            time: timeStamp,
                            text: lyricText
                          });
                          
                          // 如果下一行是歌词文本，跳过下一行
                          if (i + 1 < lines.length && !timeStampRegex.test(lines[i + 1])) {
                            i++;
                          }
                        }
                      }
                    }
                    
                    // 按照示例格式生成歌词字符串
                    let pureLyrics = '';
                    
                    // 如果有歌词行，生成格式化的字符串
                    if (timeStampLines.length > 0) {
                      // 按照示例格式生成歌词字符串
                      const formattedLines = [];
                      timeStampLines.forEach(item => {
                        formattedLines.push(item.time);  // 时间戳行
                        formattedLines.push(item.text);  // 歌词行
                      });
                      
                      // 生成带双引号的字符串
                      // 使用单个换行符，避免重复
                      const rawLyrics = formattedLines.join('\n');
                      // 检查并替换可能的多余换行符
                      const cleanedLyrics = rawLyrics.replace(/\n+/g, '\n');
                      pureLyrics = JSON.stringify(cleanedLyrics);
                    }
                    
                    localStorage.setItem('mvGenerator_lyrics', pureLyrics);
                    
                    // 关闭当前详情页
                    onClose();
                    
                    // 通知父组件切换到MV生成页面
                    // 创建并触发自定义事件
                    const event = new CustomEvent('switchToMVTab');
                    window.dispatchEvent(event);
                    
                    // 显示提示信息
                    showToast('歌词已导入到MV生成页面');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    backgroundColor: '#6B66FF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    fontWeight: 'bold'
                  }}
                  title="将歌词时间轴导入到MV生成页面"
                >
                  <FaVideo style={{ marginRight: '4px' }} /> 一键MV生成
                </button>
              </div>
              <div style={{ 
                maxHeight: '300px', 
                overflowY: 'auto',
                padding: '16px',
                backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.92))',
                borderRadius: 'var(--radius-md, 12px)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}>
                {parseLyrics(selectedSong.structure.comments).map((lyric, index) => (
                  <div key={index} style={{ 
                    display: 'flex',
                    marginBottom: '8px',
                    fontSize: '14px',
                    lineHeight: '1.6'
                  }}>
                    <span style={{ 
                      color: 'var(--primary, #4CAF50)',
                      marginRight: '16px',
                      fontFamily: 'monospace'
                    }}>
                      {Math.floor(lyric.time/60).toString().padStart(2, '0')}:
                      {(lyric.time%60).toFixed(2).padStart(5, '0')}
                    </span>
                    <span>{lyric.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
}