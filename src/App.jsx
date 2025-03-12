import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { debounce } from 'lodash';
import { apiBase } from './utils';
import { analyzeMusic } from './api/analyze';

// Import modular components
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import AnalysisResult from './components/AnalysisResult';
import SearchSection from './components/SearchSection';
import RankingSection from './components/RankingSection';
import Stats from './components/Stats';
import { ProjectIntro } from './components/ProjectIntro';
import { SongDetail } from './components/SongDetail';

function App() {
  const [file, setFile] = useState(null);
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [stats, setStats] = useState({ visitors: 0, analyses: 0 });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [rankList, setRankList] = useState([]);
  const [activeRankTab, setActiveRankTab] = useState('24hours');
  const [selectedSong, setSelectedSong] = useState(null);
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

  const fileInputRef = useRef(null);

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
  };

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
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleUpload = async () => {
    if (!file) {
      alert('请选择音频文件');
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    try {
      const response = await analyzeMusic(file, authorName, (progress) => {
        setUploadProgress(progress);
      }, privacyMode);
      if (response) {
        setRating(response.data);
        setStats(prev => ({
          ...prev,
          analyses: prev.analyses + 1
        }));
      }
    } catch (error) {
      console.error('分析失败:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || '分析失败';
      alert(errorMessage.error);
    }
    setLoading(false);
    setUploadProgress(0);
  };

  const handleTagClick = async (tag) => {
    setSelectedTag(tag);
    setRankLoading(true);
    setRankList([]);
    
    try {
      const response = await fetch(`${apiBase}/rank${tag ? `?tag=${tag}` : ''}`);
      const data = await response.json();
      setRankList(data);
    } catch (error) {
      console.error('获取排行榜失败:', error);
    } finally {
      setRankLoading(false);
    }
  };

  const fetchSongDetail = async (id) => {
    try {
      console.log('# Fetching song detail: ', id);
      const response = await fetch(`${apiBase}/song/${id}`);
      const data = await response.json();
      setSelectedSong(data[0]); // 修正：获取数组的第一个元素
    } catch (error) {
      console.error('获取歌曲详情失败:', error);
    }
  };

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
      <Header />
      
      <UploadSection 
        file={file}
        audioUrl={audioUrl}
        loading={loading}
        uploadProgress={uploadProgress}
        authorName={authorName}
        privacyMode={privacyMode}
        fileInputRef={fileInputRef}
        handleDrop={handleDrop}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
        handleFileChange={handleFileChange}
        handleUpload={handleUpload}
        setAuthorName={setAuthorName}
        setPrivacyMode={setPrivacyMode}
      />

      {rating && <AnalysisResult rating={rating} />}
      
      <ProjectIntro />
      
      <Stats stats={stats} />

      <SearchSection 
        searchQuery={searchQuery}
        searchResults={searchResults}
        searchLoading={searchLoading}
        handleInputChange={handleInputChange}
        fetchSongDetail={fetchSongDetail}
      />

      <RankingSection 
        activeRankTab={activeRankTab}
        setActiveRankTab={setActiveRankTab}
        rankList={rankList}
        rankLoading={rankLoading}
        fetchSongDetail={fetchSongDetail}
      />

      {selectedSong && <SongDetail selectedSong={selectedSong} onClose={() => setSelectedSong(null)} />}
    </div>
  );
}

export default App;
