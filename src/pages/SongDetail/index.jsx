import { useEffect, useState } from "react";
import { SongDetail } from "../../components/SongDetail";
import { apiBase } from "../../utils";
import { useParams } from 'react-router-dom';

const SongDetailPage = () => {
    const { id } = useParams(); // 获取URL中的id参数
    const [selectedSong, setSelectedSong] = useState(null);

    // get songId from 
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

    return ( <SongDetail selectedSong={selectedSong} onClose={onClose}></SongDetail>)

}

export default SongDetailPage;