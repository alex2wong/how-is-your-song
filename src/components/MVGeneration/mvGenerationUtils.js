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
  foregroundOffsetY = 0, // 添加前景图垂直偏移参数，默认为0
  lyricsOffsetY = 0, // 添加歌词垂直偏移参数，默认为0
  foregroundSize = 'medium', // 添加前景图尺寸参数，默认为中等
  foregroundShape = 'roundedRect', // 添加前景图形状参数，默认为圆角矩形
  foregroundAutoRotate = false, // 添加前景图自动旋转参数，默认为否
  selectedFont = '', // 添加选择的字体参数，默认为空字符串（使用系统默认字体）
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
    console.log('验证失败: 未选择背景');
    alert('请选择背景图片或视频');
    return Promise.reject(new Error('未选择背景'));
  }
  console.log('背景验证通过:', backgroundImage.preview || '预设背景');
  
  // 前景图是可选的，只在有前景图时记录日志
  if (foregroundImage) {
    console.log('前景图验证通过:', foregroundImage.preview || '预设前景');
    console.log('前景图形状:', foregroundShape);
    console.log('前景图自动旋转:', foregroundAutoRotate ? '是' : '否');
    console.log('前景图尺寸:', foregroundSize);
    console.log('前景图垂直偏移:', foregroundOffsetY);
  }
  
  if (!lyrics.trim()) {
    console.log('验证失败: 歌词时间轴为空');
    alert('请输入歌词时间轴');
    return Promise.reject(new Error('歌词时间轴为空'));
  }
  console.log('歌词时间轴验证通过, 长度:', lyrics.length);
  
  console.log('所有验证通过，开始设置状态');
  
  // 清理之前的资源
  cleanupResources(mediaRecorderRef, animationFrameIdRef, audioElement, null);
  
  // 创建音频URL
  const audioUrl = URL.createObjectURL(selectedMusic);
  
  // 暂停并清理旧的音频元素
  if (audioElement.src) {
    audioElement.pause();
    URL.revokeObjectURL(audioElement.src);
  }
  
  // 直接设置音频元素的属性
  audioElement.src = audioUrl;
  audioElement.load();
  audioElement.currentTime = 0;
  
  setGenerating(true);
  setStatusText('准备生成视频...');
  
  return new Promise((resolve, reject) => {
    try {
      // 解析歌词
      console.log('开始解析歌词...');
      const parsedLyrics = parseLyrics(lyrics);
      console.log('歌词解析完成, 共', parsedLyrics.length, '行');
      
      // 保存解析后的歌词数据
      setLyricsData(parsedLyrics);
      
      // 获取Canvas和上下文
      console.log('获取Canvas上下文...');
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error('Canvas元素不存在');
        setStatusText('Canvas初始化失败');
        setGenerating(false);
        return reject(new Error('Canvas元素不存在'));
      }
      
      // 设置Canvas尺寸
      if (videoOrientation === 'portrait') {
        // 竖屏视频 (9:16)
        canvas.width = 720;
        canvas.height = 1280;
      } else {
        // 横屏视频 (16:9)
        canvas.width = 1280;
        canvas.height = 720;
      }
      console.log('Canvas尺寸设置为:', canvas.width, 'x', canvas.height);
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('无法获取Canvas上下文');
        setStatusText('Canvas上下文初始化失败');
        setGenerating(false);
        return reject(new Error('无法获取Canvas上下文'));
      }
      
      // 加载背景
      console.log('开始加载背景...');
      setStatusText('加载背景中...');
      
      // 创建背景元素（图片或视频）
      const isVideo = backgroundImage.type === 'video';
      const backgroundElement = isVideo ? document.createElement('video') : new Image();
      backgroundElement.crossOrigin = 'anonymous'; // 允许跨域
      
      if (isVideo) {
        backgroundElement.muted = true;
        backgroundElement.loop = true;
        backgroundElement.playsInline = true;
      }
      
      // 创建前景元素（如果有）
      let foregroundElement = null;
      if (foregroundImage) {
        const isFgVideo = foregroundImage.type === 'video';
        foregroundElement = isFgVideo ? document.createElement('video') : new Image();
        foregroundElement.crossOrigin = 'anonymous';
        
        if (isFgVideo) {
          foregroundElement.muted = true;
          foregroundElement.loop = true;
          foregroundElement.playsInline = true;
        }
      }
      
      // 设置加载事件
      backgroundElement.onload = function() {
        console.log('背景加载完成');
        setStatusText('背景加载完成，准备生成视频...');
        
        try {
          // 创建临时音频元素用于录制
          console.log('创建临时音频元素...');
          const tempAudio = new Audio();
          // 确保使用新的Blob URL而不是重用可能已失效的URL
          const tempAudioUrl = URL.createObjectURL(selectedMusic);
          tempAudio.src = tempAudioUrl;
          tempAudio.load();
          
          // 创建MediaRecorder
          console.log('创建MediaRecorder...');
          const stream = canvas.captureStream(30);
          const audioContextRef = new (window.AudioContext || window.webkitAudioContext)();
          const audioSource = audioContextRef.createMediaElementSource(tempAudio);
          const destination = audioContextRef.createMediaStreamDestination();
          audioSource.connect(destination);
          audioSource.connect(audioContextRef.destination);
          
          // 合并视频流和音频流
          const tracks = [...stream.getVideoTracks(), ...destination.stream.getAudioTracks()];
          const combinedStream = new MediaStream(tracks);
          console.log('videoBitrate', videoBitrate);
          // 创建MediaRecorder
          const mediaRecorder = new MediaRecorder(combinedStream, {
            audioBitsPerSecond: 320000,
            mimeType: 'video/mp4;codecs=avc1.42E01E,opus',
            videoBitsPerSecond: videoBitrate * 1000000 // 将Mbps转换为bps
          });
          
          // 保存MediaRecorder引用
          mediaRecorderRef.current = mediaRecorder;
          
          // 创建数据存储数组
          const chunks = [];
          
          // 设置数据可用事件
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunks.push(e.data);
            }
          };
          
          // 设置录制结束事件
          mediaRecorder.onstop = () => {
            console.log('录制结束，开始处理视频数据...');
            setStatusText('录制结束，正在处理视频...');
            
            // 创建Blob对象
            const blob = new Blob(chunks, { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);
            
            // 设置生成的MV
            setGeneratedMV({
              url: url,
              blob: blob,
              orientation: videoOrientation
            });
            
            setStatusText('视频生成完成！');
            setGenerating(false);
            
            // 清理临时资源
            cleanupResources(null, animationFrameIdRef, tempAudio, audioContextRef);
            // 额外清理临时音频URL
            if (tempAudioUrl) {
              try {
                URL.revokeObjectURL(tempAudioUrl);
                console.log('释放临时音频URL');
              } catch (e) {
                console.error('释放临时音频URL失败:', e);
              }
            }
            
            resolve();
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
              
              // 如果是视频背景，开始播放
              if (isVideo) {
                backgroundElement.currentTime = 0;
                backgroundElement.play().catch(err => {
                  console.error('视频背景播放失败:', err);
                });
              }
              
              // 开始渲染动画
              // 在调用renderFrame前打印参数信息
              console.log('🔴 调用renderFrame前的参数检查:');
              console.log('🔴 foregroundShape:', foregroundShape);
              console.log('🔴 foregroundAutoRotate:', foregroundAutoRotate ? '是' : '否');
              
              startTimeRef.current = Date.now();
              animationFrameIdRef.current = requestAnimationFrame(() => 
                renderFrame(
                  ctx, 
                  backgroundElement, 
                  foregroundElement, // 添加前景图参数
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
                  lyricsStrokeStyle,
                  lyricsFontSize,
                  lyricsColor,
                  lyricsSecondaryColor,
                  titleFontSize,
                  titleMargin,
                  titlePosition,
                  titleColor,
                  titleSecondaryColor,
                  lyricsDisplayMode,
                  foregroundOffsetY, // 添加前景图垂直偏移参数
                  lyricsOffsetY, // 添加歌词垂直偏移参数
                  foregroundSize, // 添加前景图尺寸参数
                  selectedFont, // 添加选择的字体参数
                  foregroundShape, // 添加前景图形状参数
                  foregroundAutoRotate // 添加前景图自动旋转参数
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
              // 额外清理临时音频URL
              if (tempAudioUrl) {
                try {
                  URL.revokeObjectURL(tempAudioUrl);
                  console.log('释放临时音频URL');
                } catch (e) {
                  console.error('释放临时音频URL失败:', e);
                }
              }
              reject(error);
            });
          } else {
            console.log('临时音频播放返回undefined，直接开始渲染');
            
            // 如果是视频背景，开始播放
            if (isVideo) {
              backgroundElement.currentTime = 0;
              backgroundElement.play().catch(err => {
                console.error('视频背景播放失败:', err);
              });
            }
            
            startTimeRef.current = Date.now();
            animationFrameIdRef.current = requestAnimationFrame(() => 
              renderFrame(
                ctx, 
                backgroundElement, 
                foregroundElement, // 传递前景元素
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
                lyricsStrokeStyle,
                lyricsFontSize,
                lyricsColor,
                lyricsSecondaryColor,
                titleFontSize,
                titleMargin,
                titlePosition,
                titleColor,
                titleSecondaryColor,
                lyricsDisplayMode,
                foregroundOffsetY, // 添加前景图垂直偏移参数
                lyricsOffsetY, // 添加歌词垂直偏移参数
                foregroundSize, // 添加前景图尺寸参数
                selectedFont, // 添加选择的字体参数
                foregroundShape, // 添加前景图形状参数
                foregroundAutoRotate // 添加前景图自动旋转参数
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

          alert('当前浏览器不兼容, 请使用Chrome浏览器或者Chrome内核的浏览器!');

          // 确保在出错时也清理资源
          cleanupResources(mediaRecorderRef, animationFrameIdRef, tempAudio, audioContextRef);
          // 额外清理临时音频URL
          if (tempAudioUrl) {
            try {
              URL.revokeObjectURL(tempAudioUrl);
              console.log('释放临时音频URL');
            } catch (e) {
              console.error('释放临时音频URL失败:', e);
            }
          }
          reject(error);
        }
      };
      
      // 设置错误处理
      if (isVideo) {
        // 视频元素的错误事件
        backgroundElement.onerror = (error) => {
          console.error('背景视频加载失败:', error);
          setStatusText('背景视频加载失败');
          setGenerating(false);
          reject(new Error('背景视频加载失败'));
        };
        
        // 视频元素的加载事件
        backgroundElement.onloadeddata = backgroundElement.onload;
        
        // 设置视频源
        backgroundElement.src = backgroundImage.preview;
      } else {
        // 图片元素的错误事件
        backgroundElement.onerror = (error) => {
          console.error('背景图片加载失败:', error);
          setStatusText('背景图片加载失败');
          setGenerating(false);
          reject(new Error('背景图片加载失败'));
        };
        
        // 设置图片源
        backgroundElement.src = backgroundImage.preview;
      }
      
      // 如果有前景图，设置前景图的加载和错误处理
      if (foregroundElement) {
        const isFgVideo = foregroundImage.type === 'video';
        
        if (isFgVideo) {
          // 视频前景的错误事件
          foregroundElement.onerror = (error) => {
            console.error('前景视频加载失败:', error);
            console.log('继续使用背景图生成MV，忽略前景图');
            foregroundElement = null; // 出错时不使用前景图
          };
          
          // 视频前景的加载事件
          foregroundElement.onloadeddata = () => {
            console.log('前景视频加载成功');
          };
          
          // 设置视频源
          foregroundElement.src = foregroundImage.preview;
        } else {
          // 图片前景的错误事件
          foregroundElement.onerror = (error) => {
            console.error('前景图片加载失败:', error);
            console.log('继续使用背景图生成MV，忽略前景图');
            foregroundElement = null; // 出错时不使用前景图
          };
          
          // 图片前景的加载事件
          foregroundElement.onload = () => {
            console.log('前景图片加载成功');
          };
          
          // 设置图片源
          foregroundElement.src = foregroundImage.preview;
        }
      }
    } catch (error) {
      console.error('MV生成过程中出错:', error);
      setStatusText('MV生成失败: ' + error.message);
      setGenerating(false);
      reject(error);
    }
  });
};
