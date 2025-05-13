import React, { useCallback } from 'react';
import { apiBase } from '../utils';

export const useRankingUtils = () => {
  // 获取指定时间范围内的排行榜数据
  const fetchRankList = useCallback(async (tag, timestamp, eventTag) => {
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
      
      // 如果有活动标签，则需要获取特定活动的歌曲
      if (eventTag) {
        try {
          // 直接使用服务器端 API 的 eventTag 参数获取特定活动的歌曲
          const response = await fetch(`${apiBase}/rank?eventTag=${eventTag}`);
          const data = await response.json();
          return data;
        } catch (error) {
          console.error('获取活动歌曲失败:', error);
          return [];
        }
      }
      
      const response = await fetch(`${apiBase}/rank?${params.toString()}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('获取排行榜失败:', error);
      return [];
    }
  }, []);

  const handleTagClick = useCallback(async (tag, setSelectedTag, setRankLoading, setRankList) => {
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
  }, []);

  const fetchSongDetail = useCallback(async (id, setSelectedSong) => {
    try {
      console.log('# Fetching song detail: ', id);
      const response = await fetch(`${apiBase}/song/${id}`);
      const data = await response.json();
      setSelectedSong(data[0]); // 修正：获取数组的第一个元素
    } catch (error) {
      console.error('获取歌曲详情失败:', error);
    }
  }, []);

  return {
    fetchRankList,
    handleTagClick,
    fetchSongDetail
  };
};

export default useRankingUtils;
