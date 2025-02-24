import { useState, useEffect } from 'react'
import { FaGithub } from 'react-icons/fa'
import './App.css'
import Settings from './components/Settings'
import { analyzeMusic } from './api/analyze'
import { ProjectIntro } from './components/ProjectIntro'
import { SongDetail } from './components/SongDetail'
import { scoreClassStyles } from './utils'

const apiBase = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : '/api';

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
  const [activeRankTab, setActiveRankTab] = useState('total')
  const [selectedSong, setSelectedSong] = useState(null)
  const [showAllTags, setShowAllTags] = useState(false);

  // 获取指定时间范围内的排行榜数据
  const fetchRankList = async (tag, timestamp) => {
    try {
      if (tag === 'worst') {
        const response = await fetch(`${apiBase}/rank-reverse`);
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
    
    let tag, timestamp;
    
    switch (activeRankTab) {
      case 'weekly':
        timestamp = now - WEEK;
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
      case 'metal':
        tag = '金属';
        break;
      case 'edm':
        tag = 'EDM';
        break;
    }
    
    fetchRankList(tag, timestamp).then(setRankList);
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

  const handleUpload = async () => {
    if (!file) {
      alert('请选择音频文件')
      return
    }

    setLoading(true)
    setUploadProgress(0)
    try {
      const response = await analyzeMusic(file, (progress) => {
        setUploadProgress(progress)
      })
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
    try {
      const response = await fetch(`${apiBase}/rank${tag ? `?tag=${tag}` : ''}`)
      const data = await response.json()
      setRankList(data)
    } catch (error) {
      console.error('获取排行榜失败:', error)
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
    if (!rating) {
      return ''
    }
    let classTxt = '优秀';
    let className = 'exellent';

    if (rating.overall_score >= 8) {
      classTxt = '很优秀'
      className = 'exellent'
    } else if (rating.overall_score >= 6) {
      classTxt = '还不错'
      className = 'good'
    } else {
      classTxt = '较一般'
      className = 'normal'
    }
    return (<p className={className}> 《{rating.song_name}》 得分：{rating.overall_score} {classTxt}</p>)
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
              <td>{value.score}</td>
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
      <h1>音乐智能分析系统</h1>
      <Settings />

      <div className="upload-section">
        <input
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
          <h2>分析结果</h2>
          <div className='score'>{
            renderScoreClass(rating)}</div>
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
              { id: 'total', name: '总榜' },
              { id: 'weekly', name: '周榜' },
              { id: '48hours', name: '48小时榜' },
              { id: '24hours', name: '24小时榜' },
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
              { id: 'worst', name: '最烂榜', style: { backgroundColor: '#ff4444', color: 'white' } }
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
          {rankList.map((song, index) => (
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
              <span style={{ flex: 1, textAlign: 'left' }}>{song.song_name}</span>
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