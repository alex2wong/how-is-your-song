import React, { useState, useRef, useEffect } from 'react';
import useLocalStorageState from 'use-local-storage-state';

// 导入子组件
import MusicFileSelector from './MusicFileSelector';
import SongInfoInput from './SongInfoInput';
import TemplateSelector from './TemplateSelector';
import { isFormatSupported } from './fileUtils';
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
  const [isFormatSupportedState, setIsFormatSupportedState] = useState(true); // 默认为true，表示支持
  const [songTitle, setSongTitle] = useLocalStorageState('mvGenerator_songTitle', { defaultValue: '' });
  const [selectedTemplate, setSelectedTemplate] = useLocalStorageState('mvGenerator_selectedTemplate', { defaultValue: 'template1' });
  const [authorName, setAuthorName] = useLocalStorageState('mvGenerator_authorName', { defaultValue: '' });
  const [videoOrientation, setVideoOrientation] = useLocalStorageState('mvGenerator_videoOrientation', { defaultValue: 'landscape' }); // 'landscape' 或 'portrait'
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [foregroundImage, setForegroundImage] = useState(null);
  const [lyrics, setLyrics] = useLocalStorageState('mvGenerator_lyrics', { defaultValue: '' });
  const [generating, setGenerating] = useState(false);
  const [generatedMV, setGeneratedMV] = useState(null);
  
  // 歌词显示风格
  const [lyricsPosition, setLyricsPosition] = useLocalStorageState('mvGenerator_lyricsPosition', { defaultValue: 'bottom' }); // 'left', 'right', 'center', 'bottom'
  const [lyricsMaskStyle, setLyricsMaskStyle] = useLocalStorageState('mvGenerator_lyricsMaskStyle', { defaultValue: 'noMask' }); // 'mask', 'noMask'
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
  const [videoBitrate, setVideoBitrate] = useLocalStorageState('mvGenerator_videoBitrate', { defaultValue: 5 }); // 视频码率，默认10Mbps
  
  // 位置偏移设置
  const [foregroundOffsetY, setForegroundOffsetY] = useLocalStorageState('mvGenerator_foregroundOffsetY', { defaultValue: 0 }); // 前景图垂直偏移，默认0
  const [lyricsOffsetY, setLyricsOffsetY] = useLocalStorageState('mvGenerator_lyricsOffsetY', { defaultValue: 0 }); // 歌词垂直偏移，默认0
  
  // 前景图设置
  const [foregroundShape, setForegroundShape] = useLocalStorageState('mvGenerator_foregroundShape', { defaultValue: 'roundedRect' }); // 前景图形状，默认圆角矩形
  const [foregroundAutoRotate, setForegroundAutoRotate] = useLocalStorageState('mvGenerator_foregroundAutoRotate', { defaultValue: false }); // 前景图自动旋转，默认否
  
  // 前景图尺寸设置
  const [foregroundSize, setForegroundSize] = useLocalStorageState('mvGenerator_foregroundSize', { defaultValue: 'medium' }); // 前景图尺寸，可选值：'small', 'medium', 'large'，默认中等
  
  // 字体设置
  const [selectedFont, setSelectedFont] = useLocalStorageState('mvGenerator_selectedFont', { defaultValue: '' }); // 选择的字体，默认为空字符串表示使用系统默认字体
  
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
  const chunksRef = useRef([]);
  const audioContextRef = useRef(null);
  
  // 在组件加载时检查浏览器是否支持指定的视频录制格式
  useEffect(() => {
    const mimeType = 'video/mp4;codecs=avc1.42E01E,opus';
    const supported = isFormatSupported(mimeType);
    setIsFormatSupportedState(supported);
    
    if (!supported) {
      console.error('当前浏览器不支持视频录制格式:', mimeType);
      alert('当前浏览器不支持视频录制，无法生成MV。请使用Chrome浏览器或其他支持视频录制的现代浏览器。');
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const lyrics = localStorage.getItem("mvGenerator_lyrics");
      if (lyrics) {
        setLyrics(lyrics.replace(/\\n/g, "\n").replaceAll("\"", "").replaceAll("\\", ""));
      }
    }, 200);
  }, []);
  
  // 在组件首次加载时应用默认模板
  useEffect(() => {
    // 只在首次加载时应用默认模板
    if (selectedTemplate && !backgroundImage) {
      applyTemplate(selectedTemplate);
    }
  }, []);
  
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
      foregroundOffsetY, // 添加前景图垂直偏移参数
      lyricsOffsetY, // 添加歌词垂直偏移参数
      foregroundSize, // 添加前景图尺寸参数
      foregroundShape, // 添加前景图形状参数
      foregroundAutoRotate, // 添加前景图自动旋转参数
      selectedFont, // 添加选择的字体参数
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
  
  // 应用模板参数的函数
  const applyTemplate = (templateId) => {
    // 创建一个函数来处理背景图和前景图的加载
    const createImageObject = (src) => {
      if (!src || src === 'none') return null;
      
      // 创建符合BackgroundImageSelector组件期望的对象格式
      return {
        type: 'image',
        preview: src,
        file: null // 我们没有实际的File对象，但这个属性在预览时不是必需的
      };
    };
    
    // 根据模板ID应用不同的参数
    if (templateId === 'template1') {
      // 1. 裙角飞扬（竖版）
      setVideoOrientation('portrait');
      setBackgroundImage(createImageObject('/p1.png'));
      setForegroundImage(null);
      setLyricsPosition('left');
      setLyricsOffsetY(9);
      setLyricsDisplayMode('multiLine');
      setLyricsMaskStyle('noMask');
      setLyricsStrokeStyle('noStroke');
      setLyricsFontSize(36);
      setLyricsColor('#00ccff');
      setLyricsSecondaryColor('#ffffff');
      setTitleFontSize(40);
      setTitleMargin(80);
      setTitleColor('#00ccff');
      setTitleSecondaryColor('#ffffff');
      setTitlePosition('leftTop');
    } else if (templateId === 'template2') {
      // 2. 彩色气球（横版）
      setVideoOrientation('landscape');
      setBackgroundImage(createImageObject('/p2.png'));
      setForegroundImage(null);
      setLyricsPosition('bottom');
      setLyricsOffsetY(9);
      setLyricsDisplayMode('singleLine');
      setLyricsMaskStyle('noMask');
      setLyricsStrokeStyle('stroke');
      setLyricsFontSize(45);
      setLyricsColor('#00ccff');
      setLyricsSecondaryColor('#ffffff');
      setTitleFontSize(60);
      setTitleMargin(260);
      setTitleColor('#00ccff');
      setTitleSecondaryColor('#ffffff');
      setTitlePosition('top');
    } else if (templateId === 'template3') {
      // 3. 黑胶唱片（竖版）
      setVideoOrientation('portrait');
      setBackgroundImage(createImageObject('/p3.png'));
      setForegroundImage(createImageObject('/p2.png'));
      setForegroundSize('medium');
      setForegroundShape('circle');
      setForegroundAutoRotate(true);
      setForegroundOffsetY(-156);
      setLyricsPosition('center');
      setLyricsOffsetY(215);
      setLyricsDisplayMode('multiLine');
      setLyricsMaskStyle('noMask');
      setLyricsStrokeStyle('stroke');
      setLyricsFontSize(36);
      setLyricsColor('#00ccff');
      setLyricsSecondaryColor('#ffffff');
      setTitleFontSize(50);
      setTitleMargin(160);
      setTitleColor('#00ccff');
      setTitleSecondaryColor('#ffffff');
      setTitlePosition('top');
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
    setForegroundOffsetY(0); // 重置前景图垂直偏移
    setLyricsOffsetY(0); // 重置歌词垂直偏移
    setForegroundSize('medium'); // 重置前景图尺寸
    setForegroundShape('roundedRect'); // 重置前景图形状
    setForegroundAutoRotate(false); // 重置前景图自动旋转
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
            isFormatSupported={isFormatSupportedState}
          />
          
          {/* 步骤2：输入歌曲信息 */}
          <SongInfoInput 
            songTitle={songTitle} 
            setSongTitle={setSongTitle} 
            authorName={authorName} 
            setAuthorName={setAuthorName} 
          />
          
          {/* 步骤3：选择预设模板 */}
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            applyTemplate={applyTemplate}
          />
          
          {/* 步骤4：选择视频方向 */}
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
            foregroundOffsetY={foregroundOffsetY}
            setForegroundOffsetY={setForegroundOffsetY}
            lyricsOffsetY={lyricsOffsetY}
            setLyricsOffsetY={setLyricsOffsetY}
            foregroundSize={foregroundSize}
            setForegroundSize={setForegroundSize}
            foregroundShape={foregroundShape}
            setForegroundShape={setForegroundShape}
            foregroundAutoRotate={foregroundAutoRotate}
            setForegroundAutoRotate={setForegroundAutoRotate}
          />
          
          {/* 步骤5：输入歌词时间轴 */}
          <LyricsInput 
            lyrics={lyrics} 
            setLyrics={setLyrics} 
            selectedMusic={selectedMusic}
            songTitle={songTitle}
          />
          
          {/* 步骤6：歌词显示位置 */}
          <LyricsPositionSelector 
            lyricsPosition={lyricsPosition} 
            setLyricsPosition={setLyricsPosition}
            lyricsOffsetY={lyricsOffsetY}
            setLyricsOffsetY={setLyricsOffsetY}
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
            selectedFont={selectedFont}
            setSelectedFont={setSelectedFont}
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
