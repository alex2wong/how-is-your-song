import React, { createContext, useContext, useState, useRef } from 'react';

const BottomPlayerContext = createContext();

export const useBottomPlayer = () => {
  const context = useContext(BottomPlayerContext);
  if (!context) {
    throw new Error('useBottomPlayer must be used within a BottomPlayerProvider');
  }
  return context;
};

export const BottomPlayerProvider = ({ children }) => {
  const audioRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isError, setIsError] = useState(false);
  const [volume, setVolume] = useState(1);

  const play = (url) => {
    if (url && url !== audioUrl) {
      setAudioUrl(url);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
      }
    }
    audioRef.current?.play();
    setIsPlaying(true);
  };

  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play(audioUrl);
    }
  };

  const updateProgress = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setProgress((currentTime / duration) * 100);
    }
  };

  const seekTo = (percent) => {
    if (audioRef.current) {
      const duration = audioRef.current.duration;
      audioRef.current.currentTime = (percent / 100) * duration;
    }
  };

  const setAudioVolume = (value) => {
    if (audioRef.current) {
      audioRef.current.volume = value;
      setVolume(value);
    }
  };

  const handleError = () => {
    setIsError(true);
    setIsPlaying(false);
  };

  const value = {
    audioRef,
    audioUrl,
    isPlaying,
    progress,
    isError,
    volume,
    play,
    pause,
    togglePlay,
    seekTo,
    setAudioVolume,
  };

  return (
    <BottomPlayerContext.Provider value={value}>
      <audio
        ref={audioRef}
        onTimeUpdate={updateProgress}
        onEnded={() => setIsPlaying(false)}
        onError={handleError}
        preload="auto"
      />
      {children}
    </BottomPlayerContext.Provider>
  );
};