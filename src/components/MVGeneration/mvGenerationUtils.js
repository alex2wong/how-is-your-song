import { parseLyrics } from './lyricsUtils';
import { renderFrame } from './renderUtils';

/**
 * 清理资源
 * @param {Object} mediaRecorderRef - MediaRecorder引用
 * @param {Object} animationFrameIdRef - 动画帧ID引用
 * @param {HTMLAudioElement} audioElement - 音频元素
 * @param {AudioContext} audioContext - 音频上下文
 */
export const cleanupResources = (mediaRecorderRef, animationFrameIdRef, audioElement, audioContext) => {
  console.log('开始清理资源...');
  
  // 停止动画
  if (animationFrameIdRef && animationFrameIdRef.current) {
    console.log('取消动画帧:', animationFrameIdRef.current);
    cancelAnimationFrame(animationFrameIdRef.current);
    animationFrameIdRef.current = null;
  }
  
  // 停止录制
  if (mediaRecorderRef && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
    console.log('停止媒体录制');
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
  }
  
  // 停止音频播放
  if (audioElement) {
    console.log('停止音频播放');
    audioElement.pause();
    if (audioElement.src) {
      try {
        URL.revokeObjectURL(audioElement.src);
        console.log('释放音频元素URL');
      } catch (e) {
        console.error('释放音频元素URL失败:', e);
      }
    }
  }
  
  // 关闭音频上下文
  if (audioContext) {
    try {
      console.log('尝试关闭音频上下文...');
      if (audioContext.state !== 'closed') {
        audioContext.close().then(() => {
          console.log('音频上下文关闭成功');
        }).catch(err => {
          console.error('关闭音频上下文失败:', err);
        });
      } else {
        console.log('音频上下文已经关闭');
      }
    } catch (e) {
      console.error('关闭音频上下文时出错:', e);
    }
  }
  
  console.log('资源清理完成');
}

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
  
  // 清理之前的资源
  cleanupResources(mediaRecorderRef, animationFrameIdRef, audioElement, null);
  
  // 创建全新的音频元素，而不是重用现有的
  const newAudioElement = new Audio();
  const audioUrl = URL.createObjectURL(selectedMusic);
  newAudioElement.src = audioUrl;
  newAudioElement.load();
  
  // 暂停并清理旧的音频元素
  if (audioElement.src) {
    audioElement.pause();
    URL.revokeObjectURL(audioElement.src);
  }
  
  // 复制新音频元素的属性到原音频元素
  audioElement.src = newAudioElement.src;
  audioElement.load();
  audioElement.currentTime = 0;
  
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
    try {
      console.log('开始生成MV...');
      setGenerating(true);
      setStatusText('准备生成MV...');
      setProgress(0);
      
      // 清理之前可能存在的音频上下文
      let audioContextRef = null;
      
      // 创建背景图片
      backgroundImg.crossOrigin = 'anonymous';
      // 使用backgroundImage.file或直接使用现有的preview URL
      if (backgroundImage && backgroundImage.file) {
        console.log('使用背景图片文件创建URL');
        backgroundImg.src = URL.createObjectURL(backgroundImage.file);
      } else if (backgroundImage && backgroundImage.preview) {
        console.log('使用背景图片预览URL');
        backgroundImg.src = backgroundImage.preview;
      } else {
        console.error('背景图片格式无效:', backgroundImage);
        throw new Error('背景图片格式无效');
      }
      
      backgroundImg.onload = () => {
        try {
          console.log('背景图片加载成功');
          
          // 设置canvas尺寸
          let canvasWidth, canvasHeight;
          if (videoOrientation === 'horizontal') {
            canvasWidth = 1280;
            canvasHeight = 720;
          } else {
            canvasWidth = 720;
            canvasHeight = 1280;
          }
          
          console.log(`设置Canvas尺寸: ${canvasWidth}x${canvasHeight}`);
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          
          // 获取canvas上下文
          const ctx = canvas.getContext('2d');
          
          // 绘制初始帧
          ctx.fillStyle = 'black';
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
          
          // 绘制背景图（保持比例）
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
          console.log('初始帧绘制成功');
          
          // 创建Canvas流
          console.log('尝试创建Canvas流...');
          const stream = canvas.captureStream(30);
          console.log('Canvas流创建成功');
          
          // 创建音频上下文并加载音频
          console.log('创建音频上下文...');
          console.log('音频元素状态:', {
            src: audioElement.src ? '已设置' : '未设置',
            paused: audioElement.paused,
            ended: audioElement.ended,
            currentTime: audioElement.currentTime,
            duration: audioElement.duration || '未知'
          });
          
          // 创建新的音频元素，完全替代原来的
          const tempAudio = new Audio();
          tempAudio.src = URL.createObjectURL(selectedMusic);
          tempAudio.load();
          
          console.log('创建了临时音频元素:', tempAudio.src);
          
          // 创建音频上下文
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          audioContextRef = audioContext; // 保存引用以便后续清理
          console.log('创建了新的音频上下文');
          
          // 使用临时音频元素创建媒体源
          const audioSource = audioContext.createMediaElementSource(tempAudio);
          console.log('从临时音频元素创建了媒体源');
          
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
          
          // 创建媒体流
          const combinedStream = new MediaStream([...videoTracks, ...audioTracks]);
          
          // 设置媒体录制器
          const options = { mimeType: 'video/webm;codecs=vp9,opus' };
          const mediaRecorder = new MediaRecorder(combinedStream, options);
          mediaRecorderRef.current = mediaRecorder;
          
          const chunks = [];
          
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunks.push(e.data);
            }
          };
          
          mediaRecorder.onstop = () => {
            try {
              console.log('媒体录制停止，处理数据...');
              const blob = new Blob(chunks, { type: 'video/webm' });
              const videoUrl = URL.createObjectURL(blob);
              setGeneratedMV({
                url: videoUrl,
                name: `${songTitle || '未命名'}_${authorName || '未知'}_MV.webm`
              });
              setStatusText('MV生成完成');
              setProgress(100);
              console.log('MV生成成功，URL:', videoUrl);
              resolve(videoUrl);
            } catch (error) {
              console.error('处理录制数据时出错:', error);
              setStatusText('处理视频数据时出错');
              reject(error);
            } finally {
              setGenerating(false);
              // 在这里清理所有资源，包括音频上下文
              cleanupResources(mediaRecorderRef, animationFrameIdRef, tempAudio, audioContextRef);
            }
          };
          
          // 开始录制
          console.log('开始媒体录制...');
          mediaRecorder.start();
          
          // 开始播放音频
          console.log('尝试播放临时音频...');
          
          // 确保临时音频元素已经准备好
          tempAudio.currentTime = 0;
          
          const playPromise = tempAudio.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              console.log('临时音频播放成功，开始渲染动画');
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
                  tempAudio, // 使用临时音频元素替代原来的音频元素
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
              console.error('临时音频播放失败:', error);
              setStatusText('音频播放失败，请重试');
              if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
              }
              setGenerating(false);
              // 清理资源
              cleanupResources(mediaRecorderRef, animationFrameIdRef, tempAudio, audioContextRef);
              reject(error);
            });
          } else {
            console.log('临时音频播放返回undefined，直接开始渲染');
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
                tempAudio, // 使用临时音频元素替代原来的音频元素
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
          
          // 设置音频结束事件
          tempAudio.onended = () => {
            console.log('音频播放结束，停止录制');
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
          };
          
        } catch (error) {
          console.error('视频生成失败:', error);
          setStatusText('MV生成失败: ' + error.message);
          setGenerating(false);
          // 确保在出错时也清理资源
          cleanupResources(mediaRecorderRef, animationFrameIdRef, tempAudio, audioContextRef);
          reject(error);
        }
      };
      
      backgroundImg.onerror = (error) => {
        console.error('背景图片加载失败:', error);
        setStatusText('背景图片加载失败');
        setGenerating(false);
        reject(new Error('背景图片加载失败'));
      };
    } catch (error) {
      console.error('MV生成过程中出错:', error);
      setStatusText('MV生成失败: ' + error.message);
      setGenerating(false);
      reject(error);
    }
  });
};
