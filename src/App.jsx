import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FaGithub, FaShare } from 'react-icons/fa'
import { FaThumbsUp } from "react-icons/fa";
import './App.css'
import Settings from './components/Settings'
import { analyzeMusic } from './api/analyze'
import { ProjectIntro } from './components/ProjectIntro'
import { SongDetail } from './components/SongDetail'
import { copyShareLinkforSong, scoreClassStyles, getAuthorNameColor } from './utils'
import { debounce } from 'lodash';
import { apiBase } from './utils';


function App() {
  const [file, setFile] = useState(null)
  const [rating, setRating] = useState(null)
  const [loading, setLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [stats, setStats] = useState({ visitors: 0, analyses: 0 })
  const [uploadProgress, setUploadProgress] = useState(0)
  const [tags, setTags] = useState([])
  const [selectedTag, setSelectedTag] = useState('')
  const [rankList, setRankList] = useState([])
  const [activeRankTab, setActiveRankTab] = useState('24hours')
  const [selectedSong, setSelectedSong] = useState(null)
  const [showAllTags, setShowAllTags] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [authorName, setAuthorName] = useState(() => {
    return localStorage.getItem('authorName') || '';
  });
  const [privacyMode, setPrivacyMode] = useState(false);
  const [rankLoading, setRankLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('authorName', authorName);
  }, [authorName]);

  // 获取指定时间范围内的排行榜数据
  const fetchRankList = async (tag, timestamp) => {
    try {
      console.log('# Fetching rank list: ', tag, timestamp);
      if (tag === 'worst') {
        const response = await fetch(`${apiBase}/rank-reverse`);
        const data = await response.json();
        return data;
      }

      if (tag === 'like') {
        const response = await fetch(`${apiBase}/rank-by-likes`);
        const data = await response.json();
        return data;
      }

      if (tag === 'mylike') {
        const likedSongs = JSON.parse(localStorage.getItem('likedSongs') || '[]');
        const response = await fetch(`${apiBase}/rank-by-ids?ids=${likedSongs.join(',')}`);
        const data = await response.json();
        return data;
      }
      
      const params = new URLSearchParams();
      if (tag) params.append('tag', tag);
      if (timestamp) params.append('timestamp', timestamp);
      
      const response = await fetch(`${apiBase}/rank?${params.toString()}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('获取排行榜失败:', error);
      return [];
    }
  };

  useEffect(() => {
    // 页面加载时获取统计数据、标签列表和排行榜
    Promise.all([
      fetch(`${apiBase}/stats`).then(res => res.json()),
      fetch(`${apiBase}/tags`).then(res => res.json())
    ])
      .then(([statsData, tagsData]) => {
        setStats(statsData);
        setTags(tagsData);
      })
      .catch(console.error);
  }, []);

  // 监听activeRankTab变化，获取对应的排行榜数据
  useEffect(() => {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    const WEEK = 7 * DAY;
    const MONTH = 30 * DAY;
    
    let tag, timestamp;
    
    switch (activeRankTab) {
      case 'weekly':
        timestamp = now - WEEK;
        break;
      case 'monthly':
        timestamp = now - MONTH;
        break;
      case '48hours':
        timestamp = now - 2 * DAY;
        break;
      case '24hours':
        timestamp = now - DAY;
        break;
      case 'worst':
        tag = 'worst';
        break;
      case 'mylike':
        tag = 'mylike';
        break;
      case 'like':
        tag = 'like';
        break;
      case 'pop':
        tag = '流行';
        break;
      case 'rock':
        tag = '摇滚';
        break;
      case 'electronic':
        tag = '电子';
        break;
      case 'symphony':
        tag = '交响';
        break;
      case 'jazz':
        tag = '爵士';
        break;
      case 'folk':
        tag = '民谣';
        break;
      case 'reggae':
        tag = '雷鬼';
        break;
      case 'rap':
        tag = '说唱';
        break;
      case 'rnb':
        tag = 'R&B';
        break;
      case 'instrumental':
        tag = '纯音乐';
        break;
      case 'chinese':
        tag = '国风';
        break;
      case 'blues':
        tag = '布鲁斯';
        break;
      case 'classical':
        tag = '古典';
        break;
      case 'opera':
        tag = '歌剧';
        break;
      case 'metal':
        tag = '金属';
        break;
      case 'edm':
        tag = 'EDM';
        break;
    }
    
    setRankLoading(true);
    setRankList([]);
    
    fetchRankList(tag, timestamp)
      .then(data => {
        setRankList(data);
        setRankLoading(false);
      })
      .catch(error => {
        console.error('获取排行榜失败:', error);
        setRankLoading(false);
      });
  }, [activeRankTab]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // 如果已经存在之前的 URL，先清理掉
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    // 创建文件的 URL
    const url = URL.createObjectURL(selectedFile);
    console.log('# File Changed: ', selectedFile);
    setAudioUrl(url);
  }

  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      
      // 如果已经存在之前的 URL，先清理掉
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      // 创建文件的 URL
      const url = URL.createObjectURL(droppedFile);
      console.log('# File Dropped: ', droppedFile);
      setAudioUrl(url);
      
      // 更新 file input 的值
      if (fileInputRef.current) {
        // 创建一个新的 FileList 对象是不可能的，但我们可以使用 DataTransfer 来模拟
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  }

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  }

  const handleUpload = async () => {
    if (!file) {
      alert('请选择音频文件')
      return
    }

    setLoading(true)
    setUploadProgress(0)
    try {
      const response = await analyzeMusic(file, authorName, (progress) => {
        setUploadProgress(progress)
      }, privacyMode)
      if (response) {
        setRating(response.data)
        setStats(prev => ({
          ...prev,
          analyses: prev.analyses + 1
        }))
      }
    } catch (error) {
      console.error('分析失败:', error)
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || '分析失败'
      alert(errorMessage.error);
    }
    setLoading(false)
    setUploadProgress(0)
  }

  const handleTagClick = async (tag) => {
    setSelectedTag(tag)
    setRankLoading(true);
    setRankList([]);
    
    try {
      const response = await fetch(`${apiBase}/rank${tag ? `?tag=${tag}` : ''}`)
      const data = await response.json()
      setRankList(data)
    } catch (error) {
      console.error('获取排行榜失败:', error)
    } finally {
      setRankLoading(false);
    }
  }

  const fetchSongDetail = async (id) => {
    try {
      console.log('# Fetching song detail: ', id);
      const response = await fetch(`${apiBase}/song/${id}`)
      const data = await response.json()
      setSelectedSong(data[0]) // 修正：获取数组的第一个元素
    } catch (error) {
      console.error('获取歌曲详情失败:', error)
    }
  }

  const renderScoreClass = (rating) => {
    if (!rating || !rating.overall_score) {
      return ''
    }

    const score = rating.overall_score;
    let classTxt = '优秀';
    let className = 'score ';

    if (score >= 8) {
      classTxt = '很优秀'
      className += 'exellent'
    } else if (score >= 6) {
      classTxt = '还不错'
      className += 'good'
    } else {
      classTxt = '较一般'
      className += 'normal'
    }
    return (<p><span>《{rating.song_name}》 得分：</span> <span className={className} style={{ backgroundColor: scoreClassStyles(score).bgColor }}>{score} {classTxt}</span></p>)
  }

  /**
   * dimensions: {"song_name":"未知歌曲","overall_score":6.8,"comments":"这是一首带有淡淡忧伤氛围的抒情慢歌。吉他伴奏营造了简约、朴实的氛围，人声是歌曲的焦点。虽然歌曲整体较为平淡，没有特别抓耳的亮点，但情感真挚，适合在安静的环境下聆听。","arrangement":{"score":6.5,"comments":"编曲以吉他为主，较为简单，突出了人声。没有太多复杂的乐器和音效，营造了一种朴实、安静的氛围。但整体略显单调，缺乏变化和层次感。"},"vocal":{"score":7.2,"comments":"男声音色干净、自然，带有一丝忧郁感，符合歌曲的整体氛围。音准和节奏感较好，情感表达较为真挚。但在演唱技巧和声音表现力上还有提升空间。"},"melody":{"score":6.7,"comments":"旋律较为平缓流畅，没有太大的起伏，与歌词和氛围较为契合。但整体记忆点不强，缺乏抓耳的hook（记忆点），容易让人听过就忘。"},"lyrics":{"score":7,"comments":"歌词内容较为直白地表达了一种失落和无奈的情感，结构完整，但缺乏一些新意和深度,意象比较老套."},"tags":["#Acoustic","#Ballad","#Male Vocal","#Chinese","#Simple","#Sad"]}
   */
  const renderDimensionsTable = (dimensions) => {
    if (!dimensions) {
      return null
    }
    const dimensionsTable = (
      <table className="dimensions-table">
        <thead>
          <tr>
            <th style={{ width: 50 }}>维度</th>
            <th style={{ width: 50 }}>得分</th>
            <th>评论</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(dimensions).map(([dimension, value]) => value && (
            <tr className='dimension-row' key={dimension}>
              <td>{dimension}</td>
              <td><span className='score' style={{ backgroundColor: scoreClassStyles(value.score).bgColor }}>{value.score}</span></td>
              <td>{value.comments}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
    return dimensionsTable
  }

  const renderTags = (tags) => {
    if (!tags) {
      return null
    }
    const tagList = tags.map((tag, index) => (
      <span key={index} className="tag">{tag}</span>
    ))
    return (
      <div>
        <h3>音乐标签</h3>
        <div className='tags'>
          {tagList}
        </div>

      </div>
    )
  }

  // 搜索歌曲
  const searchSongs = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setSearchLoading(true);
    setSearchResults([]);
    
    try {
      const response = await fetch(`${apiBase}/songs?name=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('搜索歌曲失败:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // 创建一个防抖的搜索函数，延迟300ms
  const debouncedSearch = useCallback(
    debounce((query) => {
      searchSongs(query);
    }, 300),
    [] // 空依赖数组，确保防抖函数只创建一次
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value); // 立即更新输入框的值
    debouncedSearch(value); // 防抖处理搜索请求
  };

  return (
    <div className="app">
      <a
        href="https://github.com/alex2wong/how-is-your-song.git"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          color: '#333',
          fontSize: '24px'
        }}
      >
        <FaGithub />
      </a>
      <img src='/logo.png' className="app-logo" alt="logo" style={{ width: '188px' }} />
      <Settings />

      <div 
        className="upload-section"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,audio/*"
          onChange={handleFileChange}
        />
        {audioUrl && (
          <audio src={audioUrl} controls className="audio-player">

          </audio>
        )}
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          style={{
            marginLeft: 'auto',
            display: 'block'
          }}
        >
          {loading ? '分析中...' : '开始分析'}
        </button>
        <input
          type="text"
          placeholder="请填写音乐署名或作者名，如果不填默认匿名 (例如：周杰伦、方文山)"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          style={{
            marginTop: '1rem',
            padding: '0.5rem',
            width: '100%',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
          <input
            type="checkbox"
            id="privacyMode"
            onChange={(e) => setPrivacyMode(e.target.checked)}
            style={{ marginRight: '0.5rem' }}
          />
          <label htmlFor="privacyMode" style={{ flexShrink: 0 }}>隐私模式</label>
          <span style={{ 
            marginLeft: '8px', 
            color: '#999', 
            fontSize: '12px'
          }}>
            不参与排行，不可搜索，不可分享，服务器不保存任何数据，建议使用自定义APIKEY
          </span>
        </div>

        
        
        {loading && (
          <div style={{ marginTop: '1rem', width: '100%' }}>
            <div style={{ 
              width: '100%', 
              height: '4px', 
              backgroundColor: '#eee',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${uploadProgress}%`,
                height: '100%',
                backgroundColor: '#4CAF50',
                transition: 'width 0.3s ease-in-out'
              }} />
            </div>
            <div style={{ 
              textAlign: 'center', 
              marginTop: '0.5rem',
              fontSize: '0.9rem',
              color: '#666'
            }}>
              上传进度：{uploadProgress}%
            </div>
          </div>
        )}
      </div>

      {rating && (
        <div className="result-section">
          <div className='result-title'>
            <div/>
            <h2>分析结果</h2> 
            <FaShare style={{ width: '24px!important', height: '24px!important', cursor: 'pointer', color:'#555', marginRight: '24px' }} onClick={() => copyShareLinkforSong(rating._id)} />
          </div>
          <div className='score-row'>{
            renderScoreClass(rating)}
          </div>
          <p className='summary-quote'>{rating.comments}</p>
          <div>
            {renderTags(rating.tags || rating.labels)}
          </div>
          <div className="comments">
            <h3>详细解析</h3>
            <div>
              {renderDimensionsTable({ '编曲': rating.arrangement, '人声': rating.vocal, '结构': rating.melody_structure || rating.structure, '歌词': rating.lyrics })}
            </div>
          </div>

        </div>
      )}
      <ProjectIntro />
      <div 
        style={{
          position: 'fixed',
          left: '1rem',
          bottom: '1rem',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          padding: '0.5rem',
          borderRadius: '4px',
          fontSize: '0.9rem',
          color: '#666'
        }}
      >
        <div>访问人次：{stats.visitors}</div>
        <div>分析次数：{stats.analyses}</div>
      </div>

      <div style={{
          margin: '20px 0',
          padding: '20px',
          border: '1px solid #eee',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          justifyItems: 'center',
          borderRadius: '8px' }} >
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

      {(
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
      )}

      {selectedSong && <SongDetail selectedSong={selectedSong} scoreRender={renderScoreClass} onClose={()=> {setSelectedSong(null)}} />}
    </div>
  )
}

export default App