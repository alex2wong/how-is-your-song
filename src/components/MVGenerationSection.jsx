import React, { useState, useRef, useEffect } from 'react';
import { RiVideoUploadLine, RiMusic2Line, RiFileUploadLine, RiImageAddLine, RiArrowDownSLine } from 'react-icons/ri';

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
  
  // 处理音乐文件选择
  const handleMusicFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedMusic(file);
      
      // 预览音频
      const audioUrl = URL.createObjectURL(file);
      audioElement.src = audioUrl;
    }
  };
  
  // 清除选择的音乐文件
  const handleClearMusic = () => {
    if (audioElement.src) {
      URL.revokeObjectURL(audioElement.src);
      audioElement.src = '';
    }
    setSelectedMusic(null);
    if (musicInputRef.current) {
      musicInputRef.current.value = '';
    }
  };
  
  // 处理背景图片选择
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBackgroundImage({
        file: file,
        preview: URL.createObjectURL(file)
      });
    }
  };
  
  // 清除选择的背景图片
  const handleClearImage = () => {
    if (backgroundImage && backgroundImage.preview) {
      URL.revokeObjectURL(backgroundImage.preview);
    }
    setBackgroundImage(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };
  
  // 解析歌词时间轴
  const parseLyrics = (lyricsText) => {
    const lyrics = [];
    const lines = lyricsText.split('\n').filter(line => line.trim() !== '');
    
    console.log('解析歌词，总行数:', lines.length);
    
    try {
      for (let i = 0; i < lines.length; i += 2) {
        if (i + 1 >= lines.length) break;
        
        const timeStr = lines[i].trim();
        const lyricText = lines[i + 1].trim();
        
        console.log(`解析歌词行 ${i}: 时间=${timeStr}, 文本=${lyricText}`);
        
        // 解析时间 (格式: 00:00.00)
        const timeMatch = timeStr.match(/^(\d+):(\d+)\.(\d+)$/);
        
        if (!timeMatch) {
          console.error(`时间格式错误: "${timeStr}"，应为 "分:秒.毫秒" 格式`);
          alert(`时间格式错误: "${timeStr}"，应为 "分:秒.毫秒" 格式`);
          return null;
        }
        
        const minutes = parseInt(timeMatch[1]);
        const seconds = parseInt(timeMatch[2]);
        const milliseconds = parseInt(timeMatch[3]);
        
        const timeInSeconds = minutes * 60 + seconds + milliseconds / 100;
        
        lyrics.push({
          time: timeInSeconds,
          text: lyricText
        });
      }
      
      console.log('歌词解析完成，共', lyrics.length, '条');
      return lyrics;
    } catch (e) {
      console.error('歌词解析出错:', e);
      alert('歌词解析出错: ' + e.message);
      return null;
    }
  };
  
  // 渲染视频帧
  const renderFrame = (ctx, backgroundImg, canvasWidth, canvasHeight, frameRate, lyrics) => {
    const currentTime = (Date.now() - startTimeRef.current) / 1000;
    
    // 计算进度
    const progress = Math.min(100, (currentTime / audioElement.duration) * 100);
    setProgress(progress);
    
    // 更新状态文本
    if (currentTime < 1) {
      setStatusText('开始生成视频...');
    } else if (progress > 95) {
      setStatusText('即将完成...');
    } else {
      setStatusText(`正在生成视频 (${Math.round(progress)}%)...`);
    }
    
    // 清除画布
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // 绘制背景图片（保持比例）
    const imgRatio = backgroundImg.width / backgroundImg.height;
    const canvasRatio = canvasWidth / canvasHeight;
    
    let drawWidth, drawHeight, x, y;
    
    if (imgRatio > canvasRatio) {
      drawHeight = canvasHeight;
      drawWidth = drawHeight * imgRatio;
      x = (canvasWidth - drawWidth) / 2;
      y = 0;
    } else {
      drawWidth = canvasWidth;
      drawHeight = drawWidth / imgRatio;
      x = 0;
      y = (canvasHeight - drawHeight) / 2;
    }
    
    ctx.drawImage(backgroundImg, x, y, drawWidth, drawHeight);
    
    // 绘制半透明黑色覆盖层（用于歌词区域）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, canvasHeight - 200, canvasWidth, 200);
    
    // 绘制歌词
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 找到当前应该显示的歌词
    let currentLyricIndex = -1;
    
    // 确保lyrics存在
    if (lyrics && lyrics.length > 0) {
      for (let i = 0; i < lyrics.length; i++) {
        if (currentTime >= lyrics[i].time) {
          currentLyricIndex = i;
        } else {
          break;
        }
      }
      
      // 绘制当前歌词和前后几行
      const centerY = canvasHeight - 100;
      const lineHeight = 40;
      
      try {
        for (let i = Math.max(0, currentLyricIndex - 2); i < Math.min(lyrics.length, currentLyricIndex + 3); i++) {
          if (i < 0 || i >= lyrics.length || !lyrics[i]) continue;
          
          const offsetY = (i - currentLyricIndex) * lineHeight;
          
          if (i === currentLyricIndex) {
            ctx.font = 'bold 28px "Microsoft YaHei", Arial, sans-serif';
            ctx.fillStyle = '#ffcc00';
          } else {
            ctx.font = '20px "Microsoft YaHei", Arial, sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          }
          
          if (lyrics[i].text) {
            console.log('绘制歌词:', i, lyrics[i].text, '在位置:', centerY + offsetY);
            ctx.fillText(lyrics[i].text, canvasWidth / 2, centerY + offsetY);
          }
        }
      } catch (e) {
        console.error('绘制歌词出错:', e);
      }
    } else {
      console.warn('没有可用的歌词数据');
    }
    
    // 检查音频是否结束
    if (audioElement.ended || audioElement.paused) {
      console.log('音频播放结束或暂停，停止渲染');
      cancelAnimationFrame(animationFrameIdRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      return;
    }
    
    // 继续下一帧
    animationFrameIdRef.current = requestAnimationFrame(() => 
      renderFrame(ctx, backgroundImg, canvasWidth, canvasHeight, frameRate, lyrics)
    );
  };
  
  // 生成MV的函数
  const handleGenerateMV = () => {
    console.log('=== handleGenerateMV 开始执行 ===');
    
    // 验证必填字段
    if (!selectedMusic) {
      console.log('验证失败: 未选择音乐文件');
      alert('请选择音乐文件');
      return;
    }
    console.log('音乐文件验证通过:', selectedMusic.name);
    
    if (!backgroundImage) {
      console.log('验证失败: 未选择背景图片');
      alert('请选择背景图片');
      return;
    }
    console.log('背景图片验证通过:', backgroundImage.file.name);
    
    if (!lyrics.trim()) {
      console.log('验证失败: 歌词时间轴为空');
      alert('请输入歌词时间轴');
      return;
    }
    console.log('歌词时间轴验证通过, 长度:', lyrics.length);
    
    console.log('所有验证通过，开始设置状态');
    
    setGenerating(true);
    setStatusText('准备生成视频...');
    setProgress(0);
    
    // 使用本地变量存储录制的数据块，而不是依赖状态
    const chunks = [];
    
    console.log('状态已设置，开始解析歌词');
    
    // 解析歌词时间轴
    const parsedLyrics = parseLyrics(lyrics);
    
    if (!parsedLyrics) {
      console.log('歌词解析失败');
      setGenerating(false);
      return;
    }
    
    console.log('歌词解析成功，共', parsedLyrics.length, '行');
    console.log('歌词数据:', JSON.stringify(parsedLyrics));
    
    // 立即设置歌词数据，确保在渲染前可用
    setLyricsData(parsedLyrics);
    
    // 确保Canvas已经准备好
    if (!canvasRef.current) {
      console.error('Canvas元素未找到');
      setStatusText('Canvas元素未找到，请刷新页面重试');
      setGenerating(false);
      return;
    }
    
    console.log('Canvas元素已找到，设置尺寸');
    
    // 设置Canvas尺寸
    const canvas = canvasRef.current;
    if (videoOrientation === 'landscape') {
      canvas.width = 1280;
      canvas.height = 720;
      console.log('设置Canvas尺寸为横版:', canvas.width, 'x', canvas.height);
    } else {
      canvas.width = 720;
      canvas.height = 1280;
      console.log('设置Canvas尺寸为竖版:', canvas.width, 'x', canvas.height);
    }
    
    setStatusText('加载资源中...');
    console.log('开始加载背景图片...');
    
    // 开始渲染视频
    const ctx = canvas.getContext('2d');
    console.log('获取Canvas上下文:', ctx ? '成功' : '失败');
    
    const backgroundImg = new Image();
    console.log('创建Image对象');
    
    // 添加图片加载事件
    backgroundImg.onload = () => {
      console.log('背景图片加载成功:', backgroundImg.width, 'x', backgroundImg.height);
      setStatusText('准备开始生成...');
      
      // 先绘制一帧，确保Canvas内容可见
      try {
        // 清除画布
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制背景图片（保持比例）
        const imgRatio = backgroundImg.width / backgroundImg.height;
        const canvasRatio = canvas.width / canvas.height;
        
        let drawWidth, drawHeight, x, y;
        
        if (imgRatio > canvasRatio) {
          drawHeight = canvas.height;
          drawWidth = drawHeight * imgRatio;
          x = (canvas.width - drawWidth) / 2;
          y = 0;
        } else {
          drawWidth = canvas.width;
          drawHeight = drawWidth / imgRatio;
          x = 0;
          y = (canvas.height - drawHeight) / 2;
        }
        
        ctx.drawImage(backgroundImg, x, y, drawWidth, drawHeight);
        console.log('初始帧绘制成功');
      } catch (e) {
        console.error('初始帧绘制失败:', e);
        setStatusText('Canvas绘制失败: ' + e.message);
        setGenerating(false);
        return;
      }
      
      // 延迟一点时间，确保UI更新
      setTimeout(() => {
        try {
          setStatusText('开始生成视频...');
          
          // 设置音频
          audioElement.currentTime = 0;
          
          // 创建媒体流
          let stream;
          try {
            console.log('尝试创建Canvas流...');
            // 使用captureStream方法
            stream = canvas.captureStream(30);
            console.log('Canvas流创建成功');
          } catch (e) {
            console.error('captureStream失败，尝试备用方法:', e);
            // 如果不支持captureStream，尝试使用mozCaptureStream (Firefox)
            if (canvas.mozCaptureStream) {
              stream = canvas.mozCaptureStream(30);
              console.log('mozCaptureStream创建成功');
            } else {
              throw new Error('您的浏览器不支持Canvas视频捕获');
            }
          }
          
          if (!stream) {
            throw new Error('无法创建媒体流');
          }
          
          // 创建音频上下文并加载音频
          console.log('创建音频上下文...');
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const audioSource = audioContext.createMediaElementSource(audioElement);
          const audioDestination = audioContext.createMediaStreamDestination();
          
          // 连接音频节点
          audioSource.connect(audioDestination);
          audioSource.connect(audioContext.destination); // 也连接到扬声器，这样我们可以听到声音
          
          console.log('音频节点连接成功');
          
          // 合并视频和音频流
          console.log('合并视频和音频流...');
          const videoTracks = stream.getVideoTracks();
          const audioTracks = audioDestination.stream.getAudioTracks();
          
          console.log('视频轨道数:', videoTracks.length);
          console.log('音频轨道数:', audioTracks.length);
          
          const combinedStream = new MediaStream([
            ...videoTracks,
            ...audioTracks
          ]);
          
          console.log('合并流创建成功，轨道数:', combinedStream.getTracks().length);
          
          // 创建MediaRecorder
          console.log('尝试创建MediaRecorder...');
          let mediaRecorder;
          
          try {
            const options = { mimeType: 'video/mp4' };
            mediaRecorder = new MediaRecorder(combinedStream, options);
            console.log('MediaRecorder创建成功(mp4)');
          } catch (e) {
            console.warn('mp4编码不支持，尝试默认编码:', e);
            try {
              // 尝试其他编码
              const options = { mimeType: 'video/webm' };
              mediaRecorder = new MediaRecorder(combinedStream, options);
              console.log('MediaRecorder创建成功(webm)');
            } catch (e2) {
              console.error('所有编码尝试失败，使用无选项创建:', e2);
              // 如果不支持编码，尝试使用默认选项
              mediaRecorder = new MediaRecorder(combinedStream);
              console.log('MediaRecorder创建成功(无选项)');
            }
          }
          
          mediaRecorderRef.current = mediaRecorder;
          
          // 设置数据处理
          mediaRecorder.ondataavailable = (event) => {
            console.log('收到数据块:', event.data?.size || 0, '字节');
            if (event.data && event.data.size > 0) {
              // 直接添加到本地数组，而不是使用状态
              chunks.push(event.data);
              console.log('当前已收集', chunks.length, '个数据块');
            }
          };
          
          // 设置录制完成处理
          mediaRecorder.onstop = () => {
            console.log('录制停止，处理数据...');
            try {
              // 使用本地变量中的数据块
              console.log('收集到', chunks.length, '个数据块');
              
              if (chunks.length === 0) {
                throw new Error('未能录制视频数据');
              }
              
              const videoBlob = new Blob(chunks, {
                type: 'video/mp4'
              });
              console.log('视频Blob创建成功，大小:', videoBlob.size, '字节');
              
              const videoUrl = URL.createObjectURL(videoBlob);
              
              setGeneratedMV({
                url: videoUrl,
                name: `${songTitle}_${authorName}_MV.mp4`
              });
              
              setStatusText('视频生成完成！');
              setProgress(100);
            } catch (error) {
              console.error('视频合成失败:', error);
              setStatusText(`视频合成失败: ${error.message}`);
            } finally {
              setGenerating(false);
            }
          };
          
          // 开始录制
          console.log('开始录制...');
          mediaRecorder.start(100); // 每100ms收集一次数据
          
          // 开始播放音频
          console.log('尝试播放音频...');
          const playPromise = audioElement.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              console.log('音频播放成功，开始渲染动画');
              // 开始渲染动画
              startTimeRef.current = Date.now();
              animationFrameIdRef.current = requestAnimationFrame(() => 
                renderFrame(ctx, backgroundImg, canvas.width, canvas.height, 30, parsedLyrics)
              );
            }).catch(error => {
              console.error('音频播放失败:', error);
              setStatusText('音频播放失败，请重试');
              if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
              }
              setGenerating(false);
            });
          } else {
            console.log('音频播放返回undefined，直接开始渲染');
            startTimeRef.current = Date.now();
            animationFrameIdRef.current = requestAnimationFrame(() => 
              renderFrame(ctx, backgroundImg, canvas.width, canvas.height, 30, parsedLyrics)
            );
          }
          
        } catch (error) {
          console.error('视频生成失败:', error);
          setStatusText(`视频生成失败: ${error.message}`);
          setGenerating(false);
        }
      }, 500); // 延迟500ms确保UI更新
    };
    
    backgroundImg.onerror = (e) => {
      console.error('背景图片加载失败:', e);
      setStatusText('背景图片加载失败，请重试');
      setGenerating(false);
    };
    
    // 设置图片源
    console.log('设置背景图片源:', backgroundImage.preview);
    backgroundImg.src = backgroundImage.preview;
  };
  
  // 生命周期管理
  useEffect(() => {
    // 设置Canvas尺寸
    if (canvasRef.current) {
      if (videoOrientation === 'landscape') {
        canvasRef.current.width = 1280;
        canvasRef.current.height = 720;
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
  
  // 示例歌词
  const exampleLyrics = `00:00.00
(Intro - Saxophone)
00:15.06
我很想要一个答案
00:17.68
来填补我生命的空缺
00:22.04
一场雷阵雨如何能浇灭
00:26.62
这些不安的火焰
00:29.94
不是每一个春天都是春天
00:33.61
不是每一段恋情都会圆满`;
  
  // 填充示例歌词
  const fillExampleLyrics = () => {
    setLyrics(exampleLyrics);
  };
  
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
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', color: '#4A5568' }}>1. 选择音乐文件</h3>
            {!selectedMusic ? (
              <div 
                style={{
                  border: '2px dashed #e2e8f0',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#f8fafc'
                }}
                onClick={() => musicInputRef.current.click()}
              >
                <RiMusic2Line style={{ fontSize: '2rem', color: '#6B66FF', marginBottom: '10px' }} />
                <p style={{ color: '#718096' }}>点击选择音乐文件（支持 MP3、WAV 格式）</p>
                <input
                  ref={musicInputRef}
                  type="file"
                  accept=".mp3,.wav,audio/*"
                  onChange={handleMusicFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '12px', 
                backgroundColor: 'rgba(107, 102, 255, 0.05)', 
                borderRadius: '8px'
              }}>
                <RiMusic2Line style={{ fontSize: '1.5rem', color: '#6B66FF', marginRight: '12px' }} />
                <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <div style={{ fontWeight: 'bold' }}>{selectedMusic.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {(selectedMusic.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
                <button 
                  onClick={handleClearMusic}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#718096',
                    fontSize: '1.2rem'
                  }}
                >
                  <RiFileUploadLine />
                </button>
              </div>
            )}
          </div>
          
          {/* 步骤2：输入歌曲信息 */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', color: '#4A5568' }}>2. 输入歌曲信息</h3>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#4A5568' }}>歌曲标题</label>
                <input 
                  type="text" 
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder="请输入歌曲标题"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#4A5568' }}>作者名称</label>
                <input 
                  type="text" 
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="请输入作者名称"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* 步骤3：选择视频方向 */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', color: '#4A5568' }}>3. 选择视频方向</h3>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div 
                onClick={() => setVideoOrientation('landscape')}
                style={{
                  flex: 1,
                  padding: '15px',
                  border: `2px solid ${videoOrientation === 'landscape' ? '#6B66FF' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: videoOrientation === 'landscape' ? 'rgba(107, 102, 255, 0.05)' : 'white'
                }}
              >
                <div style={{ 
                  width: '100%', 
                  height: '60px', 
                  backgroundColor: '#e2e8f0',
                  borderRadius: '4px',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#718096',
                  fontSize: '0.8rem'
                }}>16:9</div>
                <div style={{ fontWeight: videoOrientation === 'landscape' ? 'bold' : 'normal' }}>横版视频</div>
              </div>
              <div 
                onClick={() => setVideoOrientation('portrait')}
                style={{
                  flex: 1,
                  padding: '15px',
                  border: `2px solid ${videoOrientation === 'portrait' ? '#6B66FF' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: videoOrientation === 'portrait' ? 'rgba(107, 102, 255, 0.05)' : 'white'
                }}
              >
                <div style={{ 
                  width: '60px', 
                  height: '100px', 
                  backgroundColor: '#e2e8f0',
                  borderRadius: '4px',
                  marginBottom: '10px',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#718096',
                  fontSize: '0.8rem'
                }}>9:16</div>
                <div style={{ fontWeight: videoOrientation === 'portrait' ? 'bold' : 'normal' }}>竖版视频</div>
              </div>
            </div>
          </div>
          
          {/* 步骤4：选择背景图片 */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', color: '#4A5568' }}>4. 选择背景图片</h3>
            {!backgroundImage ? (
              <div 
                style={{
                  border: '2px dashed #e2e8f0',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#f8fafc'
                }}
                onClick={() => imageInputRef.current.click()}
              >
                <RiImageAddLine style={{ fontSize: '2rem', color: '#6B66FF', marginBottom: '10px' }} />
                <p style={{ color: '#718096' }}>点击选择背景图片（将根据视频方向自动裁剪）</p>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <img 
                  src={backgroundImage.preview} 
                  alt="背景图片预览" 
                  style={{ 
                    width: '100%', 
                    maxWidth: '100%', 
                    height: 'auto', 
                    objectFit: 'contain', 
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }} 
                />
                <button 
                  onClick={handleClearImage}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#4A5568'
                  }}
                >
                  <RiFileUploadLine />
                </button>
              </div>
            )}
          </div>
          
          {/* 步骤5：输入歌词时间轴 */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#4A5568' }}>5. 输入带时间戳的歌词</h3>
              <button 
                onClick={fillExampleLyrics}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#6B66FF',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}
              >
                填充示例
              </button>
            </div>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="请按照以下格式输入歌词时间轴：
00:00.00
(Intro - Saxophone)
00:15.06
我很想要一个答案
..."
              style={{
                width: '100%',
                height: '200px',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '1rem',
                fontFamily: 'monospace',
                resize: 'vertical'
              }}
            ></textarea>
            <p style={{ fontSize: '0.9rem', color: '#718096', marginTop: '5px' }}>
              格式说明：每行时间戳（分:秒.毫秒）后面跟着对应的歌词内容。可直接将排行榜中歌曲评分后的歌词时间轴复制过来使用。
            </p>
          </div>
          
          {/* 预览区域 */}
          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#000',
            aspectRatio: videoOrientation === 'landscape' ? '16/9' : '9/16',
            maxHeight: '300px',
            margin: '0 auto 20px auto',
            display: generating ? 'flex' : 'none',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <canvas 
              ref={canvasRef} 
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }} 
            />
          </div>
          
          {/* 步骤6：开始生成 */}
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={handleGenerateMV}
              disabled={generating}
              style={{
                backgroundColor: generating ? '#a0aec0' : '#6B66FF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '15px 24px',
                fontWeight: 'bold',
                cursor: generating ? 'not-allowed' : 'pointer',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1.1rem'
              }}
            >
              <RiVideoUploadLine />
              {generating ? '生成中...' : '开始生成MV'}
            </button>
            
            {generating && (
              <div style={{ marginTop: '15px' }}>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: '#718096', 
                  textAlign: 'center',
                  marginBottom: '15px'
                }}>
                  {statusText || '正在生成视频...'}
                </div>
              </div>
            )}
          </div>
          
          {/* 步骤7和8：视频预览和下载 */}
          {generatedMV && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '15px', fontSize: '1.1rem', color: '#4A5568' }}>生成结果</h3>
              <video 
                controls 
                style={{ 
                  width: '100%', 
                  borderRadius: '8px', 
                  backgroundColor: '#000',
                  aspectRatio: videoOrientation === 'landscape' ? '16/9' : '9/16',
                  maxHeight: '500px',
                  margin: '0 auto',
                  display: 'block'
                }}
                src={generatedMV.url}
              >
                您的浏览器不支持视频播放
              </video>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center', 
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{generatedMV.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                    {videoOrientation === 'landscape' ? '横版 16:9' : '竖版 9:16'} • {songTitle} • {authorName}
                  </div>
                </div>
                <a 
                  href={generatedMV.url} 
                  download={generatedMV.name}
                  style={{
                    backgroundColor: '#6B66FF',
                    color: 'white',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <RiArrowDownSLine /> 下载MV
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MVGenerationSection;
