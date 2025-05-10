import React, { useState, useRef, useEffect } from 'react';
import { exampleLyrics } from './lyricsUtils';
import { RiAiGenerate } from 'react-icons/ri';
import { FaEdit, FaPlay, FaPause, FaPlus } from 'react-icons/fa';
import { apiBase } from '../../api/analyze';
import Modal from '../common/Modal';

/**
 * 歌词输入组件
 */
const LyricsInput = ({ lyrics, setLyrics, selectedMusic }) => {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [showLyricsEditor, setShowLyricsEditor] = useState(false);
  const [lyricsLines, setLyricsLines] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentLine, setCurrentLine] = useState(-1);
  const audioRef = useRef(null);
  const audioUrl = selectedMusic ? URL.createObjectURL(selectedMusic) : null;

  // 格式化时间为 [mm:ss.xx] 格式
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds % 1) * 100);
    
    return `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}]`;
  };

  // 处理播放/暂停
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // 重新加载音频源并播放
        if (audioUrl) {
          audioRef.current.load();
          audioRef.current.play().catch(err => {
            console.error('播放失败:', err);
            alert('播放失败，请检查音频文件');
          });
        }
      }
    }
  };
  
  // 处理进度条变化
  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current && !isNaN(newTime)) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // 更新当前时间和处理音频事件
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    const handlePlay = () => {
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
    };
    
    // 添加事件监听器
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    
    // 清理函数
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [showLyricsEditor]);

  // 添加时间戳到当前选中的行
  const addTimestamp = () => {
    if (!audioRef.current) return;
    
    // 确保行索引有效
    if (currentLine < 0 || currentLine >= lyricsLines.length) {
      setCurrentLine(0);
      return;
    }
    
    // 复制歌词行数组
    const updatedLines = [...lyricsLines];
    
    // 更新当前行的时间戳
    updatedLines[currentLine] = {
      ...updatedLines[currentLine],
      timestamp: formatTime(currentTime),
      hasTimestamp: true
    };
    
    // 更新状态
    setLyricsLines(updatedLines);
    
    // 自动跳转到下一行（如果有下一行）
    if (currentLine < lyricsLines.length - 1) {
      setTimeout(() => {
        setCurrentLine(currentLine + 1);
      }, 100);
    }
  };
  
  // 点击时间戳跳转到对应时间
  const jumpToTimestamp = (timestamp) => {
    if (!audioRef.current || !timestamp) return;
    
    // 解析时间戳 [mm:ss.xx]
    const match = timestamp.match(/\[(\d{2}):(\d{2})\.(\d{2})\]/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = parseInt(match[3], 10) / 100;
      
      const timeInSeconds = minutes * 60 + seconds + milliseconds;
      
      // 设置音频播放位置
      audioRef.current.currentTime = timeInSeconds;
      setCurrentTime(timeInSeconds);
      
      // 如果当前没有播放，则开始播放
      if (!isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('播放失败:', err);
        });
      }
    }
  };

  // 保存手动制作的歌词
  const saveLyrics = () => {
    // 将歌词行数组转换回文本格式
    const formattedLyrics = lyricsLines.map(line => {
      if (line.hasTimestamp) {
        return `${line.timestamp}${line.text}`;
      } else {
        return line.text;
      }
    }).join('\n');
    
    setLyrics(formattedLyrics);
    setShowLyricsEditor(false);
  };

  return (
    <>
      {showLyricsEditor && (
        <Modal title="手动制作滚动歌词" onClose={() => setShowLyricsEditor(false)}>
          <div style={{ padding: '20px', width: '100%', maxWidth: '800px' }}>
            <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <audio 
                ref={audioRef} 
                style={{ display: 'none' }}
                preload="metadata"
              >
                {audioUrl && <source src={audioUrl} type="audio/mpeg" />}
              </audio>
              <button 
                onClick={handlePlayPause}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#6B66FF',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <div style={{ fontSize: '1.2rem', fontFamily: 'monospace' }}>
                {formatTime(currentTime).replace('[', '').replace(']', '')}
              </div>
              <div style={{ flex: 1 }}></div>
              <button
                onClick={addTimestamp}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '8px 15px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                <FaPlus /> 添加时间戳
              </button>
              </div>
              
              {/* 进度条 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                <span style={{ fontSize: '0.9rem', fontFamily: 'monospace', minWidth: '45px' }}>
                  {formatTime(currentTime).replace('[', '').replace(']', '').substring(0, 5)}
                </span>
                <input
                  type="range"
                  min="0"
                  max={audioRef.current ? audioRef.current.duration || 100 : 100}
                  step="0.1"
                  value={currentTime}
                  onChange={handleProgressChange}
                  style={{
                    flex: 1,
                    height: '6px',
                    borderRadius: '3px',
                    accentColor: '#6B66FF'
                  }}
                />
                <span style={{ fontSize: '0.9rem', fontFamily: 'monospace', minWidth: '45px' }}>
                  {audioRef.current && audioRef.current.duration ? 
                    formatTime(audioRef.current.duration).replace('[', '').replace(']', '').substring(0, 5) : 
                    '00:00'}
                </span>
              </div>
            </div>
            
            <div
              style={{
                width: '100%',
                height: '300px',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '1rem',
                fontFamily: 'monospace',
                overflowY: 'auto'
              }}
            >
              {lyricsLines.map((line, index) => (
                <div 
                  key={index}
                  onClick={() => {
                    setCurrentLine(index);
                    // 如果有时间戳，点击时跳转到对应时间
                    if (line.hasTimestamp) {
                      jumpToTimestamp(line.timestamp);
                    }
                  }}
                  style={{
                    padding: '5px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: currentLine === index ? 'rgba(107, 102, 255, 0.2)' : 'transparent',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    marginBottom: '5px'
                  }}
                >
                  <div 
                    style={{ 
                      width: '100px', 
                      color: line.hasTimestamp ? '#4CAF50' : '#999',
                      fontWeight: line.hasTimestamp ? 'bold' : 'normal',
                      marginRight: '10px',
                      cursor: line.hasTimestamp ? 'pointer' : 'default'
                    }}
                    onClick={(e) => {
                      if (line.hasTimestamp) {
                        e.stopPropagation(); // 防止触发外层的点击事件
                        jumpToTimestamp(line.timestamp);
                      }
                    }}
                  >
                    {line.hasTimestamp ? line.timestamp : '[ 无时间戳 ]'}
                  </div>
                  <div style={{ flex: 1 }}>
                    {line.text}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setShowLyricsEditor(false)}
                style={{
                  padding: '8px 15px',
                  background: '#E2E8F0',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                取消
              </button>
              <button 
                onClick={saveLyrics}
                style={{
                  padding: '8px 15px',
                  background: '#6B66FF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                保存
              </button>
            </div>
          </div>
        </Modal>
      )}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#4A5568' }}>5. 输入带时间戳的歌词</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
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
            <button 
              onClick={async () => {
                if (!selectedMusic) {
                  alert('请先选择音乐文件');
                  return;
                }
                
                try {
                  setIsRecognizing(true);
                  
                  const formData = new FormData();
                  formData.append('audio', selectedMusic);
                  
                  // 从localStorage中读取模型配置，与歌曲分析API保持一致
                  const geminiKey = localStorage.getItem('gemini_key');
                  const modelName = localStorage.getItem('model_name') || 'gemini-2.0-flash';
                  
                  // 构建API URL，包含模型名称和可能的API密钥
                  const apiUrl = `${apiBase}/getLyrics?model_name=${modelName}${geminiKey ? `&gemini_key=${geminiKey}` : ''}`;
                  
                  const response = await fetch(apiUrl, {
                    method: 'POST',
                    body: formData
                  });
                  
                  if (!response.ok) {
                    throw new Error(`识别失败: ${response.status}`);
                  }
                  
                  const data = await response.json();
                  console.log('lyrics data:', data.lyrics);
                  if (data.lyrics) {
                    // 所有返回的都是文本，需要判断是否是JSON格式
                    const text = data.lyrics;
                    try {
                      // 判断是否是JSON格式
                      if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
                        const parsedData = JSON.parse(text);
                        
                        if (Array.isArray(parsedData)) {
                          // 判断是否是包含 time 和 line 属性的歌词数组
                          if (parsedData.length > 0 && parsedData[0].time && parsedData[0].line) {
                            // 将数组转换为 LRC 格式
                            const lrcLines = parsedData.map(item => `[${item.time}]${item.line}`);
                            setLyrics(lrcLines.join('\n'));
                          } else {
                            // 普通数组，用换行符连接
                            setLyrics(parsedData.join('\n'));
                          }
                        } else if (typeof parsedData === 'object') {
                          // 如果是对象，获取所有值并用换行符连接
                          const values = Object.values(parsedData);
                          setLyrics(values.join('\n'));
                        } else {
                          // 其他情况直接使用原始文本
                          setLyrics(text);
                        }
                      } else {
                        // 不是JSON格式，直接使用
                        setLyrics(text);
                      }
                    } catch (e) {
                      // JSON解析失败，直接使用原始文本
                      console.log('解析JSON失败，使用原始文本', e);
                      setLyrics(text);
                    }
                  }
                } catch (error) {
                  console.error('识别歌词失败:', error);
                  alert(`识别歌词失败: ${error.message}`);
                } finally {
                  setIsRecognizing(false);
                }
              }}
              disabled={isRecognizing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'transparent',
                border: '1px solid rgb(52, 139, 165)',
                borderRadius: '12px',
                color: '#6B66FF',
                cursor: isRecognizing ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                opacity: isRecognizing ? 0.7 : 1
              }}
            >
              {isRecognizing ? '识别中...' : 'AI识别歌词'}
              {!isRecognizing && <RiAiGenerate />}
            </button>
            <button 
              onClick={() => {
                if (!selectedMusic) {
                  alert('请先选择音乐文件');
                  return;
                }
                
                // 检查是否有歌词输入
                if (!lyrics || lyrics.trim() === '') {
                  alert('请先在下方文本框中输入歌词，每行一句');
                  return;
                }
                
                // 将歌词按行分割并处理
                const lines = lyrics.split('\n').filter(line => line.trim() !== '');
                
                // 将每行歌词转换为对象数组
                const processedLines = lines.map(line => {
                  // 检查是否已有时间戳
                  const timestampMatch = line.match(/^\[(\d{2}):(\d{2})\.(\d{2})\](.*)$/);
                  if (timestampMatch) {
                    return {
                      timestamp: `[${timestampMatch[1]}:${timestampMatch[2]}.${timestampMatch[3]}]`,
                      text: timestampMatch[4].trim(),
                      hasTimestamp: true
                    };
                  } else {
                    return {
                      timestamp: '',
                      text: line.trim(),
                      hasTimestamp: false
                    };
                  }
                });
                
                setLyricsLines(processedLines);
                setShowLyricsEditor(true);
                setCurrentLine(0);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'transparent',
                border: '1px solid rgb(52, 139, 165)',
                borderRadius: '12px',
                color: '#6B66FF',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}
            >
              手动制作滚动歌词
              <FaEdit />
            </button>
          </div>
        </div>
        <textarea
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          placeholder="请按照以下格式输入歌词时间轴：
[00:15.10]风从萧山吹过来，拥紧凉角冻结成雾海
[00:22.26]世人善也叹倾诉心中之音少人能懂
[00:29.28]月亮从云海走来，洒下碧血更有伤的白
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
    </>
  );
};

export default LyricsInput;
