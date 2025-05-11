import React, { useState, useRef, useEffect } from 'react';
import useLocalStorageState from 'use-local-storage-state';

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
  const [songTitle, setSongTitle] = useLocalStorageState('mvGenerator_songTitle', { defaultValue: '' });
  const [authorName, setAuthorName] = useLocalStorageState('mvGenerator_authorName', { defaultValue: '' });
  const [videoOrientation, setVideoOrientation] = useLocalStorageState('mvGenerator_videoOrientation', { defaultValue: 'landscape' }); // 'landscape' 或 'portrait'
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [foregroundImage, setForegroundImage] = useState(null);
  const [lyrics, setLyrics] = useLocalStorageState('mvGenerator_lyrics', { defaultValue: '' });
  const [generating, setGenerating] = useState(false);
  const [generatedMV, setGeneratedMV] = useState(null);
  
  // 歌词显示风格
  const [lyricsPosition, setLyricsPosition] = useLocalStorageState('mvGenerator_lyricsPosition', { defaultValue: 'bottom' }); // 'left', 'right', 'center', 'bottom'
  const [lyricsMaskStyle, setLyricsMaskStyle] = useLocalStorageState('mvGenerator_lyricsMaskStyle', { defaultValue: 'mask' }); // 'mask', 'noMask'
  const [lyricsStrokeStyle, setLyricsStrokeStyle] = useLocalStorageState('mvGenerator_lyricsStrokeStyle', { defaultValue: 'noStroke' }); // 'stroke', 'noStroke'
  const [lyricsFontSize, setLyricsFontSize] = useLocalStorageState('mvGenerator_lyricsFontSize', { defaultValue: 28 }); // 数字类型，默认28像素
  const [lyricsColor, setLyricsColor] = useLocalStorageState('mvGenerator_lyricsColor', { defaultValue: '#ffcc00' }); // 主色，高亮歌词颜色
  const [lyricsSecondaryColor, setLyricsSecondaryColor] = useLocalStorageState('mvGenerator_lyricsSecondaryColor', { defaultValue: '#ffffff' }); // 配色，非高亮歌词颜色
  const [lyricsDisplayMode, setLyricsDisplayMode] = useLocalStorageState('mvGenerator_lyricsDisplayMode', { defaultValue: 'multiLine' }); // 'multiLine'(多行模式) 或 'singleLine'(单行模式)
  
  // 标题设置
  const [titleFontSize, setTitleFontSize] = useLocalStorageState('mvGenerator_titleFontSize', { defaultValue: 24 }); // 标题字号，默认24像素
  const [titleMargin, setTitleMargin] = useLocalStorageState('mvGenerator_titleMargin', { defaultValue: 60 }); // 标题边距，默认60像素
  const [titlePosition, setTitlePosition] = useLocalStorageState('mvGenerator_titlePosition', { defaultValue: 'leftTop' }); // 标题位置，默认左上角
  const [titleColor, setTitleColor] = useLocalStorageState('mvGenerator_titleColor', { defaultValue: '#ffcc00' }); // 主标题颜色，默认黄色
  const [titleSecondaryColor, setTitleSecondaryColor] = useLocalStorageState('mvGenerator_titleSecondaryColor', { defaultValue: '#ffffff' }); // 副标题颜色，默认白色
  
  // 视频设置
  const [videoBitrate, setVideoBitrate] = useLocalStorageState('mvGenerator_videoBitrate', { defaultValue: 10 }); // 视频码率，默认10Mbps
  
  // 视频生成相关状态
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [audioElement] = useState(new Audio());
  const [lyricsData, setLyricsData] = useState([]);
  
  // Refs
  const musicInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const foregroundInputRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const startTimeRef = useRef(0);
  
  // 生成MV的函数
  const handleGenerateMV = () => {
    // 如果已经生成过MV，需要先清理资源
    if (generatedMV) {
      // 清理之前的资源
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }
      
      // 清理旧的音频元素
      if (audioElement.src) {
        audioElement.pause();
        URL.revokeObjectURL(audioElement.src);
        // 重置音频元素的src属性
        audioElement.removeAttribute('src');
      }
      
      // 清理旧的视频资源
      if (generatedMV && generatedMV.url) {
        URL.revokeObjectURL(generatedMV.url);
      }
      
      // 重置生成状态
      setGeneratedMV(null);
    }
    
    // 开始生成新的MV
    setGenerating(true);
    setProgress(0);
    setStatusText('准备生成视频...');
    
    // 调用生成MV的核心函数
    generateMV({
      selectedMusic,
      backgroundImage,
      foregroundImage, // 添加前景图参数
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
      lyricsFontSize,
      lyricsColor,
      lyricsSecondaryColor,
      lyricsDisplayMode,
      titleFontSize,
      titleMargin,
      titlePosition,
      titleColor,
      titleSecondaryColor,
      videoBitrate,
      setGenerating,
      setStatusText,
      setProgress,
      setLyricsData,
      setGeneratedMV
    }).catch(error => {
      console.error('MV生成失败:', error);
      setStatusText('MV生成失败: ' + error.message);
      setGenerating(false);
    });
  };
  
  // 终止MV生成的函数
  const handleTerminateMV = () => {
    console.log('用户终止MV生成');
    
    // 清理资源
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    
    // 暂停音频播放
    if (audioElement) {
      audioElement.pause();
    }
    
    // 更新状态
    setGenerating(false);
    setStatusText('MV生成已终止');
    
    // 如果有部分生成的视频，清理它
    if (generatedMV && generatedMV.url) {
      URL.revokeObjectURL(generatedMV.url);
      setGeneratedMV(null);
    }
  };
  
  // 重置所有字段的函数
  const resetAllFields = () => {
    // 清理音频元素
    if (audioElement) {
      audioElement.pause();
      if (audioElement.src) {
        URL.revokeObjectURL(audioElement.src);
        audioElement.src = '';
      }
    }
    
    // 重置所有状态
    setSelectedMusic(null);
    setSongTitle('');
    setAuthorName('');
    setVideoOrientation('landscape');
    setBackgroundImage(null);
    setForegroundImage(null);
    setLyrics('');
    setGenerating(false);
    setGeneratedMV(null);
    setLyricsPosition('bottom');
    setLyricsMaskStyle('mask');
    setLyricsStrokeStyle('noStroke');
    setLyricsFontSize(28);
    setLyricsColor('#ffcc00');
    setLyricsSecondaryColor('#ffffff');
    setTitlePosition('leftTop');
    setTitleFontSize(24);
    setTitleMargin(60);
    setTitleColor('#ffcc00');
    setTitleSecondaryColor('#ffffff');
    setLyricsDisplayMode('multiLine');
    setProgress(0);
    setStatusText('');
    
    // 重置文件输入
    if (musicInputRef.current) {
      musicInputRef.current.value = '';
    }
    
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
    
    if (foregroundInputRef.current) {
      foregroundInputRef.current.value = '';
    }
    
    // 重置画布尺寸
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
    
    console.log('已重置所有字段，准备生成新的歌曲MV');
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
            foregroundImage={foregroundImage}
            setForegroundImage={setForegroundImage}
            imageInputRef={imageInputRef}
            foregroundInputRef={foregroundInputRef}
          />
          
          {/* 步骤5：输入歌词时间轴 */}
          <LyricsInput 
            lyrics={lyrics} 
            setLyrics={setLyrics} 
            selectedMusic={selectedMusic}
          />
          
          {/* 步骤6：歌词显示位置 */}
          <LyricsPositionSelector 
            lyricsPosition={lyricsPosition} 
            setLyricsPosition={setLyricsPosition} 
          />
          
          {/* 步骤7：显示风格设置 */}
          <LyricsStyleSelector 
            lyricsMaskStyle={lyricsMaskStyle} 
            setLyricsMaskStyle={setLyricsMaskStyle} 
            lyricsStrokeStyle={lyricsStrokeStyle} 
            setLyricsStrokeStyle={setLyricsStrokeStyle} 
            lyricsFontSize={lyricsFontSize}
            setLyricsFontSize={setLyricsFontSize}
            lyricsColor={lyricsColor}
            setLyricsColor={setLyricsColor}
            lyricsSecondaryColor={lyricsSecondaryColor}
            setLyricsSecondaryColor={setLyricsSecondaryColor}
            titleFontSize={titleFontSize}
            setTitleFontSize={setTitleFontSize}
            titleMargin={titleMargin}
            setTitleMargin={setTitleMargin}
            titlePosition={titlePosition}
            setTitlePosition={setTitlePosition}
            titleColor={titleColor}
            setTitleColor={setTitleColor}
            titleSecondaryColor={titleSecondaryColor}
            setTitleSecondaryColor={setTitleSecondaryColor}
            videoBitrate={videoBitrate}
            setVideoBitrate={setVideoBitrate}
            lyricsDisplayMode={lyricsDisplayMode}
            setLyricsDisplayMode={setLyricsDisplayMode}
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
            handleTerminateMV={handleTerminateMV}
            generating={generating} 
            statusText={statusText} 
            generatedMV={generatedMV}
            resetAllFields={resetAllFields}
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
