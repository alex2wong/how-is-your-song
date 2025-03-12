import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { apiBase } from '../utils';

export const useAppState = () => {
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

  return {
    file, setFile,
    rating, setRating,
    loading, setLoading,
    audioUrl, setAudioUrl,
    stats, setStats,
    uploadProgress, setUploadProgress,
    tags, setTags,
    selectedTag, setSelectedTag,
    rankList, setRankList,
    activeRankTab, setActiveRankTab,
    selectedSong, setSelectedSong,
    showAllTags, setShowAllTags,
    searchQuery, setSearchQuery,
    searchResults, setSearchResults,
    authorName, setAuthorName,
    privacyMode, setPrivacyMode,
    rankLoading, setRankLoading,
    searchLoading, setSearchLoading,
    handleInputChange
  };
};

export default useAppState;
