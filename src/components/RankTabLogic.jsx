import { useEffect } from 'react';

export const useRankTabLogic = (activeRankTab, setRankLoading, setRankList, fetchRankList) => {
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
};

export default useRankTabLogic;
