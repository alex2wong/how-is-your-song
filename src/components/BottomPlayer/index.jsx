import React, { useState } from 'react';
import { useBottomPlayer } from './BottomPlayerContext';
import { RiPlayFill, RiPauseFill, RiVolumeMuteFill, RiVolumeUpFill} from 'react-icons/ri'

const BottomPlayer = () => {
  const {
    isPlaying,
    progress,
    isError,
    volume,
    togglePlay,
    seekTo,
    setAudioVolume,
    audioRef
  } = useBottomPlayer();

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const [currentSpeed, setCurrentSpeed] = useState(1);

  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget;
    const clickX = e.nativeEvent.offsetX;
    const width = progressBar.clientWidth;
    seekTo((clickX / width) * 100);
  };

  const handleVolumeChange = (e) => {
    setAudioVolume(parseFloat(e.target.value));
  };

  const handleSpeedChange = (speed) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
      setCurrentSpeed(speed);
      setShowSpeedMenu(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = audioRef.current ? audioRef.current.currentTime : 0;
  const duration = audioRef.current ? audioRef.current.duration : 0;

  if (isError) {
    return (
      <div className="bottom-player-error" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTop: '1px solid #eee',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ff4d4f',
      }}>
        音频加载失败
      </div>
    );
  }

  return (
    <div className="bottom-player" style={{
      position: 'fixed',
      bottom: 0,
      left: 40,
      right: 40,
      backgroundColor: '#fff',
      borderTop: '1px solid #eee',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      borderRadius: '8px',
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
      zIndex: 1000
    }}>
      <button
        onClick={togglePlay}
        style={{
          cursor: 'pointer',
          width: 30,
          height: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          borderRadius: '50%',
          backgroundColor: '#6B66FF',
          color: '#fff',
          transition: 'all 0.2s ease'
        }}
      >
        {isPlaying ? <RiPauseFill style={{ width: 20, height: 20, flexShrink: 0 }} color="#fff" /> : <RiPlayFill style={{ width: 20, height: 20, flexShrink: 0 }} color="#fff" />}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '12px' }}>
        {formatTime(currentTime)}
      </div>

      <div className="progress-container" style={{
        flex: 1,
        cursor: 'pointer',
      }}>
        <div
          className="progress-bar"
          style={{
            width: '100%',
            height: '4px',
            backgroundColor: 'rgba(107, 102, 255, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
          onClick={handleProgressClick}
        >
          <div
            className="progress"
            style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #6B66FF, #8A84FF)',
              transition: 'width 0.1s linear',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '12px' }}>
        {formatTime(duration)}
      </div>

      <div className="volume-control" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '120px',
      }}>
        {volume === 0 ? <RiVolumeMuteFill size={20} /> : <RiVolumeUpFill size={20} />}
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          style={{
            flex: 1,
            height: '4px',
            borderRadius: '2px',
            accentColor: '#6B66FF'
          }}
        />
      </div>
    </div>
  );
};

export default BottomPlayer;