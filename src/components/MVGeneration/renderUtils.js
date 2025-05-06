/**
 * 渲染视频帧
 * @param {CanvasRenderingContext2D} ctx - Canvas上下文
 * @param {HTMLImageElement} backgroundImg - 背景图片
 * @param {number} canvasWidth - Canvas宽度
 * @param {number} canvasHeight - Canvas高度
 * @param {number} frameRate - 帧率
 * @param {Array} lyrics - 歌词数据
 * @param {number} startTimeRef - 开始时间引用
 * @param {HTMLAudioElement} audioElement - 音频元素
 * @param {Function} setProgress - 设置进度的状态函数
 * @param {Function} setStatusText - 设置状态文本的状态函数
 * @param {Object} mediaRecorderRef - MediaRecorder引用
 * @param {Object} animationFrameIdRef - 动画帧ID引用
 * @param {string} songTitle - 歌曲标题
 * @param {string} authorName - 作者名称
 * @param {string} lyricsPosition - 歌词位置
 * @param {string} lyricsMaskStyle - 歌词遮罩样式
 * @param {string} lyricsStrokeStyle - 歌词描边样式
 */
export const renderFrame = (
  ctx, 
  backgroundImg, 
  canvasWidth, 
  canvasHeight, 
  frameRate, 
  lyrics,
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
) => {
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
  
  // 根据歌词样式决定是否绘制半透明黑色覆盖层
  if (lyricsMaskStyle === 'mask') {
    // 根据歌词位置绘制不同位置的遮罩
    if (lyricsPosition === 'bottom') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, canvasHeight - 200, canvasWidth, 200);
    } else if (lyricsPosition === 'left') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvasWidth * 0.3, canvasHeight);
    } else if (lyricsPosition === 'right') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(canvasWidth * 0.7, 0, canvasWidth * 0.3, canvasHeight);
    } else if (lyricsPosition === 'center') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      const centerWidth = canvasWidth * 0.6;
      ctx.fillRect((canvasWidth - centerWidth) / 2, canvasHeight / 2 - 100, centerWidth, 200);
    }
  }
  
  // 在左上角绘制歌曲标题和作者名称
  if (songTitle || authorName) {
    const padding = 20; // 边距
    
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // 绘制半透明背景 (只有在选择了蒙版样式时才显示)
    if (lyricsMaskStyle === 'mask') {
      if (songTitle && authorName) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvasWidth * 0.5, 100);
      } else if (songTitle || authorName) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvasWidth * 0.5, 60);
      }
    }
    
    // 绘制歌曲标题（主标题）
    if (songTitle) {
      ctx.font = 'bold 32px "Microsoft YaHei", Arial, sans-serif';
      ctx.fillStyle = '#ffffff';
      
      // 如果需要描边效果
      if (lyricsStrokeStyle === 'stroke' || lyricsMaskStyle === 'noMask') {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 3;
        ctx.strokeText(songTitle, padding, padding);
      }
      
      ctx.fillText(songTitle, padding, padding);
    }
    
    // 绘制作者名称（副标题）
    if (authorName) {
      ctx.font = '22px "Microsoft YaHei", Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      
      // 如果需要描边效果
      if (lyricsStrokeStyle === 'stroke' || lyricsMaskStyle === 'noMask') {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeText(authorName, padding, songTitle ? padding + 40 : padding);
      }
      
      ctx.fillText(authorName, padding, songTitle ? padding + 40 : padding);
    }
  }
  
  // 绘制歌词
  // 根据位置设置文本对齐方式
  if (lyricsPosition === 'left') {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
  } else if (lyricsPosition === 'right') {
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
  } else {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
  }
  
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
    
    // 根据位置设置歌词绘制的中心点坐标
    let centerX, centerY;
    const lineHeight = 40;
    
    if (lyricsPosition === 'left') {
      centerX = canvasWidth * 0.15;
      centerY = canvasHeight / 2;
    } else if (lyricsPosition === 'right') {
      centerX = canvasWidth * 0.85;
      centerY = canvasHeight / 2;
    } else if (lyricsPosition === 'center') {
      centerX = canvasWidth / 2;
      centerY = canvasHeight / 2;
    } else { // bottom
      centerX = canvasWidth / 2;
      centerY = canvasHeight - 100;
    }
    
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
          // 根据样式决定是否添加描边
          if (lyricsStrokeStyle === 'stroke') {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.lineWidth = 3;
            ctx.strokeText(lyrics[i].text, centerX, centerY + offsetY);
          }
          
          ctx.fillText(lyrics[i].text, centerX, centerY + offsetY);
        }
      }
    } catch (e) {
      console.error('歌词绘制错误:', e);
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
    renderFrame(
      ctx, 
      backgroundImg, 
      canvasWidth, 
      canvasHeight, 
      frameRate, 
      lyrics,
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
};
