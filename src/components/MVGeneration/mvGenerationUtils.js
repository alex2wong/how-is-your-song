import { parseLyrics } from './lyricsUtils';
import { renderFrame } from './renderUtils';

/**
 * 生成MV的核心逻辑
 * @param {Object} params - 参数对象
 * @returns {Promise} 返回一个Promise，resolve时表示生成成功，reject时表示生成失败
 */
export const generateMV = async ({
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
}) => {
  console.log('=== handleGenerateMV 开始执行 ===');
  
  // 验证必填字段
  if (!selectedMusic) {
    console.log('验证失败: 未选择音乐文件');
    alert('请选择音乐文件');
    return Promise.reject(new Error('未选择音乐文件'));
  }
  console.log('音乐文件验证通过:', selectedMusic.name);
  
  if (!backgroundImage) {
    console.log('验证失败: 未选择背景图片');
    alert('请选择背景图片');
    return Promise.reject(new Error('未选择背景图片'));
  }
  console.log('背景图片验证通过:', backgroundImage.file.name);
  
  if (!lyrics.trim()) {
    console.log('验证失败: 歌词时间轴为空');
    alert('请输入歌词时间轴');
    return Promise.reject(new Error('歌词时间轴为空'));
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
    return Promise.reject(new Error('歌词解析失败'));
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
    return Promise.reject(new Error('Canvas元素未找到'));
  }
  
  console.log('Canvas元素已找到，设置尺寸');
  
  // 设置Canvas尺寸
  const canvas = canvasRef.current;
  if (videoOrientation === 'landscape') {
    canvas.width = 1280;
    canvas.height = 720;
    console.log('设置Canvas尺寸为横版:', canvas.width, 'x', canvas.height);
  } else if (videoOrientation === 'landscape43') {
    canvas.width = 1280;
    canvas.height = 960;
    console.log('设置Canvas尺寸为4:3横版:', canvas.width, 'x', canvas.height);
  } else if (videoOrientation === 'square') {
    canvas.width = 1080;
    canvas.height = 1080;
    console.log('设置Canvas尺寸为正方形:', canvas.width, 'x', canvas.height);
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
  
  return new Promise((resolve, reject) => {
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
        reject(new Error('Canvas绘制失败: ' + e.message));
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
              resolve();
            } catch (error) {
              console.error('视频合成失败:', error);
              setStatusText(`视频合成失败: ${error.message}`);
              reject(error);
            } finally {
              setGenerating(false);
            }
          };
          
          // 开始播放音频
          console.log('尝试播放音频...');
          
          // 确保音频元素已经准备好
          if (!audioElement.src) {
            console.error('音频源未设置');
            setStatusText('音频源未设置，请重新选择音乐文件');
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
            setGenerating(false);
            reject(new Error('音频源未设置'));
            return;
          }
          
          console.log('音频源已设置:', audioElement.src);
          
          // 重新加载音频以确保它已准备好播放
          audioElement.load();
          audioElement.currentTime = 0;
          
          const playPromise = audioElement.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              console.log('音频播放成功，开始渲染动画');
              // 开始渲染动画
              startTimeRef.current = Date.now();
              animationFrameIdRef.current = requestAnimationFrame(() => 
                renderFrame(
                  ctx, 
                  backgroundImg, 
                  canvas.width, 
                  canvas.height, 
                  30, 
                  parsedLyrics,
                  startTimeRef,
                  audioElement,
                  setProgress,
                  setStatusText,
                  mediaRecorderRef,
                  animationFrameIdRef,
                  songTitle,
                  authorName,
                  lyricsPosition,
                  lyricsMaskStyle,
                  lyricsStrokeStyle
                )
              );
            }).catch(error => {
              console.error('音频播放失败:', error);
              setStatusText('音频播放失败，请重试');
              if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
              }
              setGenerating(false);
              reject(error);
            });
          } else {
            console.log('音频播放返回undefined，直接开始渲染');
            startTimeRef.current = Date.now();
            animationFrameIdRef.current = requestAnimationFrame(() => 
              renderFrame(
                ctx, 
                backgroundImg, 
                canvas.width, 
                canvas.height, 
                30, 
                parsedLyrics,
                startTimeRef,
                audioElement,
                setProgress,
                setStatusText,
                mediaRecorderRef,
                animationFrameIdRef,
                songTitle,
                authorName,
                lyricsPosition,
                lyricsMaskStyle,
                lyricsStrokeStyle
              )
            );
          }
          
          // 开始录制
          console.log('开始录制...');
          mediaRecorder.start(100); // 每100ms收集一次数据
          
        } catch (error) {
          console.error('视频生成失败:', error);
          setStatusText(`视频生成失败: ${error.message}`);
          setGenerating(false);
          reject(error);
        }
      }, 500); // 延迟500ms确保UI更新
    };
    
    backgroundImg.onerror = (e) => {
      console.error('背景图片加载失败:', e);
      setStatusText('背景图片加载失败，请重试');
      setGenerating(false);
      reject(new Error('背景图片加载失败'));
    };
    
    // 设置图片源
    console.log('设置背景图片源:', backgroundImage.preview);
    backgroundImg.src = backgroundImage.preview;
  });
};
