import React, { useState, useRef, useEffect } from 'react';

// 导入子组件
import MusicFileSelector from './MusicFileSelector';
import SongInfoInput from './SongInfoInput';
import VideoOrientationSelector from './VideoOrientationSelector';
import BackgroundImageSelector from './BackgroundImageSelector';
import LyricsInput from './LyricsInput';
import LyricsPositionSelector from './LyricsPositionSelector';
import LyricsStyleSelector from './LyricsStyleSelector';
import PreviewCanvas from './PreviewCanvas';
import GenerateButton from './GenerateButton';
import VideoResult from './VideoResult';

// 导入工具函数
import { generateMV } from './mvGenerationUtils';

/**
 * MV生成主组件
 */
const MVGenerationSection = () => {
  // 基本状态
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [songTitle, setSongTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [videoOrientation, setVideoOrientation] = useState('landscape'); // 'landscape' 或 'portrait'
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [lyrics, setLyrics] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedMV, setGeneratedMV] = useState(null);
  
  // 歌词显示风格
  const [lyricsPosition, setLyricsPosition] = useState('bottom'); // 'left', 'right', 'center', 'bottom'
  const [lyricsMaskStyle, setLyricsMaskStyle] = useState('mask'); // 'mask', 'noMask'
  const [lyricsStrokeStyle, setLyricsStrokeStyle] = useState('noStroke'); // 'stroke', 'noStroke'
  
  // 视频生成相关状态
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [audioElement] = useState(new Audio());
  const [lyricsData, setLyricsData] = useState([]);
  
  // Refs
  const musicInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const startTimeRef = useRef(0);
  
  // 生成MV的函数
  const handleGenerateMV = () => {
    generateMV({
      selectedMusic,
      backgroundImage,
      lyrics,
      canvasRef,
      videoOrientation,
      audioElement,
      mediaRecorderRef,
      animationFrameIdRef,
      startTimeRef,
      songTitle,
      authorName,
      lyricsPosition,
      lyricsMaskStyle,
      lyricsStrokeStyle,
      setGenerating,
      setStatusText,
      setProgress,
      setLyricsData,
      setGeneratedMV
    }).catch(error => {
      console.error('MV生成失败:', error);
    });
  };
  
  // 生命周期管理
  useEffect(() => {
    // 设置Canvas尺寸
    if (canvasRef.current) {
      if (videoOrientation === 'landscape') {
        canvasRef.current.width = 1280;
        canvasRef.current.height = 720;
      } else if (videoOrientation === 'landscape43') {
        canvasRef.current.width = 1280;
        canvasRef.current.height = 960;
      } else if (videoOrientation === 'square') {
        canvasRef.current.width = 1080;
        canvasRef.current.height = 1080;
      } else {
        canvasRef.current.width = 720;
        canvasRef.current.height = 1280;
      }
    }
  }, [videoOrientation]);

  // 清理函数
  useEffect(() => {
    return () => {
      // 清理资源
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      
      if (audioElement) {
        audioElement.pause();
        if (audioElement.src) {
          URL.revokeObjectURL(audioElement.src);
        }
      }
      
      if (generatedMV && generatedMV.url) {
        URL.revokeObjectURL(generatedMV.url);
      }
    };
  }, [audioElement, generatedMV]);
  
  return (
    <section className="mv-generation-section">
      <div style={{ 
        padding: '0', 
        backgroundColor: 'white', 
        borderRadius: '10px', 
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px',
        overflow: 'hidden'
      }}>
        <div style={{ 
          background: 'var(--primary-gradient)', 
          height: '6px', 
          width: '100%' 
        }}></div>
        <div style={{ padding: '20px' }}>
          <h2 style={{ marginBottom: '10px', color: '#2D3748' }}>一键MV生成</h2>
          <p style={{ color: '#4A5568', marginBottom: '20px' }}>
            生成过程完全在本地浏览器，不上传任何数据，保护您的隐私和数据安全。
          </p>
          
          {/* 步骤1：选择音乐文件 */}
          <MusicFileSelector 
            selectedMusic={selectedMusic} 
            setSelectedMusic={setSelectedMusic} 
            audioElement={audioElement} 
            musicInputRef={musicInputRef} 
          />
          
          {/* 步骤2：输入歌曲信息 */}
          <SongInfoInput 
            songTitle={songTitle} 
            setSongTitle={setSongTitle} 
            authorName={authorName} 
            setAuthorName={setAuthorName} 
          />
          
          {/* 步骤3：选择视频方向 */}
          <VideoOrientationSelector 
            videoOrientation={videoOrientation} 
            setVideoOrientation={setVideoOrientation} 
          />
          
          {/* 步骤4：选择背景图片 */}
          <BackgroundImageSelector 
            backgroundImage={backgroundImage} 
            setBackgroundImage={setBackgroundImage} 
            imageInputRef={imageInputRef} 
          />
          
          {/* 步骤5：输入歌词时间轴 */}
          <LyricsInput 
            lyrics={lyrics} 
            setLyrics={setLyrics} 
          />
          
          {/* 步骤6：歌词显示位置 */}
          <LyricsPositionSelector 
            lyricsPosition={lyricsPosition} 
            setLyricsPosition={setLyricsPosition} 
          />
          
          {/* 步骤7：歌词显示风格 */}
          <LyricsStyleSelector 
            lyricsMaskStyle={lyricsMaskStyle} 
            setLyricsMaskStyle={setLyricsMaskStyle} 
            lyricsStrokeStyle={lyricsStrokeStyle} 
            setLyricsStrokeStyle={setLyricsStrokeStyle} 
          />
          
          {/* 预览区域 */}
          <PreviewCanvas 
            canvasRef={canvasRef} 
            videoOrientation={videoOrientation} 
            generating={generating} 
          />
          
          {/* 步骤8：开始生成 */}
          <GenerateButton 
            handleGenerateMV={handleGenerateMV} 
            generating={generating} 
            statusText={statusText} 
          />
          
          {/* 步骤9和10：视频预览和下载 */}
          <VideoResult 
            generatedMV={generatedMV} 
            videoOrientation={videoOrientation} 
            songTitle={songTitle} 
            authorName={authorName} 
          />
        </div>
      </div>
    </section>
  );
};

export default MVGenerationSection;
