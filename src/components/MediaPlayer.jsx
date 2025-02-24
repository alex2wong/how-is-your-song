
import React, { useState, useRef, useEffect } from 'react';


const MediaPlayer = ({ audioUrl }) => {
  const audioRef = useRef(new Audio(audioUrl));
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isError, setIsError] = useState(false);

  // 更新进度条
  const updateProgress = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setProgress((currentTime / duration) * 100);
    }
  };

  const handleBtnClick = (e) => {
    if (!audioRef.current) { return }
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  // 跳转到指定时间
  const handleProgressClick = (e) => {
    if (audioRef.current) {
      const progressBar = e.currentTarget;
      const clickX = e.nativeEvent.offsetX;
      const width = progressBar.clientWidth;
      const duration = audioRef.current.duration;
      audioRef.current.currentTime = (clickX / width) * duration;
    }
  };

  const handlePaused = () => {
    setIsPlaying(false)
  }
  
  const handleError = (e) => {
    console.warn(`audio error: ${JSON.stringify(e)}`)
    setIsError(true);
  }

  useEffect(() =>{
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', updateProgress);
      audioRef.current.addEventListener('pause', handlePaused);
      audioRef.current.addEventListener('error', handleError);
      audioRef.current.preload = 'auto';
      audioRef.current.load();
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', updateProgress);
        audioRef.current.removeEventListener('pause', handlePaused);
        audioRef.current.pause();
      }
    }
  }, [])

  const renderAudioPlayer = () => (
    <div className="audio-player" style={{
      display: 'flex',
      width: '100%',
      maxWidth: '240px',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
        <div onClick={handleBtnClick} style={{ cursor: 'pointer', width: 24 }}>{ isPlaying ? '⏸️' : '▶️' }</div>
        <div className="progress-bar" style={{
          width: '100%',
          height: '8px',
          marginLeft: 12,
          backgroundColor: '#f0f0f0',
          borderRadius: 8,
          overflow: 'hidden'
        }} onClick={handleProgressClick}>
          <div className="progress" style={{ width: `${progress}%`, height:'8px', backgroundColor: 'green' }}></div>
        </div>
    </div>
  );

  return isError? <div style={{ backgroundColor:'orange', padding: 2, borderRadius: 4 }}>音频加载失败</div> : renderAudioPlayer();

};

export default MediaPlayer;
