import { useEffect, useState } from "react";
import { SongDetail } from "../../components/SongDetail";
import { apiBase } from "../../utils";
import { useParams } from 'react-router-dom';
import "./index.css";

const SongDetailPage = () => {
  const { id } = useParams(); // 获取URL中的id参数
  const [selectedSong, setSelectedSong] = useState(null);

  // 从URL中获取查询参数
  const queryParams = new URLSearchParams(window.location.search);
  const isLocalData = queryParams.get('local') === 'true';

  // 获取歌曲详情，可以从localStorage或API
  const fetchSongDetail = async (id) => {
    // 如果URL参数中有local=true，则从localStorage中获取数据
    if (isLocalData) {
      try {
        console.log('# Loading song detail from localStorage');
        const localData = localStorage.getItem('tempSongDetail');
        if (localData) {
          const parsedData = JSON.parse(localData);
          setSelectedSong(parsedData);
          return;
        }
      } catch (error) {
        console.error('从localStorage加载数据失败:', error);
        // 如果从localStorage加载失败，回退到从API获取
      }
    }

    // 从API获取数据
    try {
      console.log('# Fetching song detail from API: ', id);
      const response = await fetch(`${apiBase}/song/${id}`)
      const data = await response.json()
      setSelectedSong(data[0]) // 修正：获取数组的第一个元素
    } catch (error) {
      console.error('获取歌曲详情失败:', error)
    }
  }
  const onClose = () => {
    location.href = '/';
  }

  useEffect(() => {
    if (id) {
      fetchSongDetail(id);
    }
  }, [id])

  useEffect(() => {
    console.log('# page url : ', id, location.href);
  }, [])

  if (!selectedSong) {
    return <div>加载中...</div>;
  }

  return (<SongDetail selectedSong={selectedSong} onClose={onClose}></SongDetail>)

}

export default SongDetailPage;