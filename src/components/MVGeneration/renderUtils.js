/**
 * 渲染视频帧
 * @param {CanvasRenderingContext2D} ctx - Canvas上下文
 * @param {HTMLImageElement|HTMLVideoElement} background - 背景图片或视频
 * @param {HTMLImageElement|HTMLVideoElement} foreground - 前景图片或视频（可选）
 * @param {number} canvasWidth - Canvas宽度
 * @param {number} canvasHeight - Canvas高度
 * @param {number} frameRate - 帧率
 * @param {Array} lyrics - 歌词数据
 * @param {Object} startTimeRef - 开始时间引用
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
 * @param {number} lyricsFontSize - 歌词字号，像素值
 * @param {string} lyricsColor - 主色，高亮歌词颜色
 * @param {string} lyricsSecondaryColor - 配色，非高亮歌词颜色
 * @param {number} titleFontSize - 标题字号，像素值
 * @param {number} titleMargin - 标题边距，像素值
 * @param {string} titlePosition - 标题位置，'leftTop'(左上)、'rightTop'(右上)、'leftBottom'(左下)、'rightBottom'(右下)、'center'(居中)
 * @param {string} titleColor - 主标题颜色
 * @param {string} titleSecondaryColor - 副标题颜色
 * @param {string} lyricsDisplayMode - 歌词显示模式，'multiLine'(多行模式) 或 'singleLine'(单行模式)
 * @param {number} foregroundOffsetY - 前景图垂直偏移，像素值
 * @param {number} lyricsOffsetY - 歌词垂直偏移，像素值
 * @param {string} foregroundSize - 前景图尺寸，可选值：'small', 'medium', 'large'
 * @param {string} foregroundShape - 前景图形状，可选值：'roundedRect', 'circle'
 * @param {boolean} foregroundAutoRotate - 前景图是否自动旋转
 */
export const renderFrame = (
  ctx, 
  background, 
  foreground = null, // 添加前景图参数，默认为null
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
  lyricsStrokeStyle,
  lyricsFontSize = 28,
  lyricsColor = '#ffcc00',
  lyricsSecondaryColor = '#ffffff',
  titleFontSize = 24,
  titleMargin = 60,
  titlePosition = 'leftTop',
  titleColor = '#ffcc00',
  titleSecondaryColor = '#ffffff',
  lyricsDisplayMode = 'multiLine',
  foregroundOffsetY = 0, // 添加前景图垂直偏移参数，默认为0
  lyricsOffsetY = 0, // 添加歌词垂直偏移参数，默认为0
  foregroundSize = 'medium', // 添加前景图尺寸参数，默认为中等
  selectedFont = '', // 添加选择的字体参数，默认为空字符串（使用系统默认字体）
  foregroundShape = 'roundedRect', // 添加前景图形状参数，默认为圆角矩形
  foregroundAutoRotate = false // 添加前景图自动旋转参数，默认为否
) => {
  try {
    const currentTime = (Date.now() - startTimeRef.current) / 1000;
    
    // 仅在首次调用时打印参数信息
    const isFirstFrame = currentTime < 0.1;
    
    // 将收到的参数打印出来，不使用全局变量
    if (isFirstFrame) {
      console.log('💚 收到的参数值:');
      console.log('💚 foregroundShape:', foregroundShape);
      console.log('💚 foregroundAutoRotate:', foregroundAutoRotate ? '是' : '否');
    }
    
    if (isFirstFrame) {
      console.log('✅ renderFrame 函数首次调用，参数检查:');
      console.log('✅ foregroundShape:', foregroundShape);
      console.log('✅ foregroundAutoRotate:', foregroundAutoRotate ? '是' : '否');
      console.log('✅ foregroundSize:', foregroundSize);
      console.log('✅ foregroundOffsetY:', foregroundOffsetY);
    }
    // 计算进度
    const progress = Math.min(100, (currentTime / audioElement.duration) * 100);
    // 使用防御性编程，确保函数存在才调用
    if (typeof setProgress === 'function') {
      setProgress(progress);
    }
    
    // 更新状态文本，添加防御性检查
    if (typeof setStatusText === 'function') {
      if (currentTime < 1) {
        setStatusText('开始生成视频...');
      } else if (progress > 95) {
        setStatusText('即将完成...');
      } else {
        setStatusText(`正在生成视频 (${Math.round(progress)}%)...`);
      }
    }
    
    // 清除画布
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // 判断是否是视频背景
    const isVideo = background.tagName === 'VIDEO';
    
    // 如果是视频且需要循环播放，检查是否需要重新播放
    if (isVideo && background.ended && background.duration < audioElement.duration) {
      background.currentTime = 0;
      background.play().catch(err => console.error('视频循环播放失败:', err));
    }
    
    // 绘制背景（保持比例）
    const bgWidth = isVideo ? background.videoWidth : background.width;
    const bgHeight = isVideo ? background.videoHeight : background.height;
    const bgRatio = bgWidth / bgHeight;
    const canvasRatio = canvasWidth / canvasHeight;
    
    let drawWidth, drawHeight, x, y;
    
    if (bgRatio > canvasRatio) {
      drawHeight = canvasHeight;
      drawWidth = drawHeight * bgRatio;
      x = (canvasWidth - drawWidth) / 2;
      y = 0;
    } else {
      drawWidth = canvasWidth;
      drawHeight = drawWidth / bgRatio;
      x = 0;
      y = (canvasHeight - drawHeight) / 2;
    }
    
    // 直接绘制背景，确保背景可见
    ctx.drawImage(background, x, y, drawWidth, drawHeight);
    
    // 如果有前景图，添加半透明遮罩层来模拟模糊效果
    if (foreground) {
      // 添加半透明遮罩层来模拟模糊效果
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    
    // 绘制前景图（如果存在）
    if (foreground && foreground.complete !== false) {
      try {
        // 判断是否是视频前景
        const isFgVideo = foreground.tagName === 'VIDEO';
        
        // 确保前景图已经加载完成
        if ((isFgVideo && foreground.readyState >= 2) || (!isFgVideo && foreground.complete)) {
          // 如果是视频且需要循环播放，检查是否需要重新播放
          if (isFgVideo && foreground.ended) {
            foreground.currentTime = 0;
            foreground.play().catch(err => console.error('前景视频循环播放失败:', err));
          }
          
          // 根据选择的尺寸计算前景图大小
          let sizeRatio;
          switch (foregroundSize) {
            case 'small':
              sizeRatio = 0.3; // 小尺寸，画布较小边长的30%
              break;
            case 'large':
              sizeRatio = 0.5; // 大尺寸，画布较小边长的50%
              break;
            case 'extraLarge':
              sizeRatio = 0.7; // 特大尺寸，画布较小边长的70%
              break;
            case 'medium':
            default:
              sizeRatio = 0.4; // 中等尺寸，画布较小边长的40%
              break;
          }
          
          // 计算将前景图绘制为圆角正方形的尺寸和位置
          const albumSize = Math.min(canvasWidth, canvasHeight) * sizeRatio; // 专辑封面大小根据选择的尺寸调整
          const albumX = (canvasWidth - albumSize) / 2; // 水平居中
          const albumY = (canvasHeight - albumSize) / 2 + foregroundOffsetY; // 垂直居中并应用偏移
          const cornerRadius = albumSize * 0.1; // 圆角半径为封面大小的10%
          
          // 根据形状绘制不同的路径
          ctx.save(); // 保存当前绘图状态
          ctx.beginPath();
          
          // 只在首次渲染或每5秒输出一次日志，避免日志过多
          if (currentTime < 0.1 || Math.floor(currentTime) % 5 === 0) {
            console.log('渲染前景图 - 形状:', foregroundShape);
            console.log('渲染前景图 - 自动旋转:', foregroundAutoRotate ? '是' : '否');
          }
          
          if (foregroundShape === 'circle') {
            // 绘制圆形路径
            const centerX = albumX + albumSize / 2;
            const centerY = albumY + albumSize / 2;
            const radius = albumSize / 2;
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            if (currentTime < 0.1) console.log('应用圆形路径');
          } else {
            // 默认绘制圆角矩形路径
            ctx.moveTo(albumX + cornerRadius, albumY);
            ctx.lineTo(albumX + albumSize - cornerRadius, albumY);
            ctx.arcTo(albumX + albumSize, albumY, albumX + albumSize, albumY + cornerRadius, cornerRadius);
            ctx.lineTo(albumX + albumSize, albumY + albumSize - cornerRadius);
            ctx.arcTo(albumX + albumSize, albumY + albumSize, albumX + albumSize - cornerRadius, albumY + albumSize, cornerRadius);
            ctx.lineTo(albumX + cornerRadius, albumY + albumSize);
            ctx.arcTo(albumX, albumY + albumSize, albumX, albumY + albumSize - cornerRadius, cornerRadius);
            ctx.lineTo(albumX, albumY + cornerRadius);
            ctx.arcTo(albumX, albumY, albumX + cornerRadius, albumY, cornerRadius);
            if (currentTime < 0.1) console.log('应用圆角矩形路径');
          }
          
          ctx.closePath();
          
          // 添加阴影效果
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 20;
          ctx.shadowOffsetX = 5;
          ctx.shadowOffsetY = 5;
          
          // 创建裁剪区域
          ctx.clip();
          
          // 获取前景图尺寸，添加防御性检查
          let fgWidth = 1;
          let fgHeight = 1;
          
          if (isFgVideo) {
            fgWidth = foreground.videoWidth || 1;
            fgHeight = foreground.videoHeight || 1;
          } else {
            fgWidth = foreground.width || 1;
            fgHeight = foreground.height || 1;
          }
          
          // 确保宽高比不为0
          const fgRatio = (fgWidth && fgHeight) ? (fgWidth / fgHeight) : 1;
          
          let fgDrawWidth, fgDrawHeight, fgX, fgY;
          
          // 确保前景图完全覆盖圆角矩形区域，保持纵横比
          if (fgRatio > 1) {
            // 如果前景图是横向的
            fgDrawHeight = albumSize;
            fgDrawWidth = fgDrawHeight * fgRatio;
            fgX = albumX - (fgDrawWidth - albumSize) / 2;
            fgY = albumY;
          } else {
            // 如果前景图是纵向的
            fgDrawWidth = albumSize;
            fgDrawHeight = fgDrawWidth / fgRatio;
            fgX = albumX;
            fgY = albumY - (fgDrawHeight - albumSize) / 2;
          }
          
          // 如果启用自动旋转，则应用旋转效果
          if (foregroundAutoRotate) {
            // 计算旋转中心点
            const centerX = fgX + fgDrawWidth / 2;
            const centerY = fgY + fgDrawHeight / 2;
            
            // 计算旋转角度，根据当前时间持续旋转
            const rotationSpeed = 0.2; // 增大旋转速度，使旋转更明显
            const rotationAngle = (currentTime * rotationSpeed) % (Math.PI * 2);
            
            // 应用旋转变换
            ctx.translate(centerX, centerY);
            ctx.rotate(rotationAngle);
            ctx.translate(-centerX, -centerY);
            
            if (currentTime < 0.1 || Math.floor(currentTime) % 5 === 0) {
              console.log('应用旋转效果 - 角度:', Math.round(rotationAngle * 180 / Math.PI), '度');
            }
          }
          
          // 绘制前景图
          ctx.drawImage(foreground, fgX, fgY, fgDrawWidth, fgDrawHeight);
          
          // 添加边框
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 3;
          ctx.stroke();
          
          ctx.restore(); // 恢复绘图状态
        }
      } catch (e) {
        console.error('绘制前景图时出错:', e);
        // 如果绘制前景图出错，恢复绘图状态以确保不影响后续绘制
        try { ctx.restore(); } catch (restoreError) {}
      }
    }
    
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
    
    // 绘制歌曲标题和作者名称（根据titlePosition设置位置）
    if (songTitle || authorName) {
      const padding = titleMargin; // 使用传入的标题边距
      
      // 根据标题位置设置文本对齐方式和位置
      let titleX, titleY, textAlign, textBaseline;
      let maskX, maskY, maskWidth, maskHeight;
      
      // 设置标题位置参数
      switch (titlePosition) {
        case 'leftTop':
          textAlign = 'left';
          textBaseline = 'top';
          titleX = padding;
          titleY = padding;
          maskX = 0;
          maskY = 0;
          break;
        case 'rightTop':
          textAlign = 'right';
          textBaseline = 'top';
          titleX = canvasWidth - padding;
          titleY = padding;
          maskX = canvasWidth * 0.5;
          maskY = 0;
          break;
        case 'top':
          textAlign = 'center';
          textBaseline = 'top';
          titleX = canvasWidth / 2;
          titleY = padding;
          maskX = canvasWidth * 0.25;
          maskY = 0;
          break;
        case 'leftBottom':
          textAlign = 'left';
          textBaseline = 'bottom';
          titleX = padding;
          titleY = canvasHeight - padding;
          maskX = 0;
          maskY = canvasHeight - 100;
          break;
        case 'rightBottom':
          textAlign = 'right';
          textBaseline = 'bottom';
          titleX = canvasWidth - padding;
          titleY = canvasHeight - padding;
          maskX = canvasWidth * 0.5;
          maskY = canvasHeight - 100;
          break;
        case 'bottom':
          textAlign = 'center';
          textBaseline = 'bottom';
          titleX = canvasWidth / 2;
          titleY = canvasHeight - padding;
          maskX = canvasWidth * 0.25;
          maskY = canvasHeight - 100;
          break;
        case 'center':
          textAlign = 'center';
          textBaseline = 'middle';
          titleX = canvasWidth / 2;
          titleY = canvasHeight / 2;
          maskX = canvasWidth * 0.25;
          maskY = canvasHeight / 2 - 50;
          break;
        default:
          textAlign = 'left';
          textBaseline = 'top';
          titleX = padding;
          titleY = padding;
          maskX = 0;
          maskY = 0;
      }
      
      ctx.textAlign = textAlign;
      ctx.textBaseline = textBaseline;
      
      // 绘制半透明背景 (只有在选择了蒙版样式时才显示)
      if (lyricsMaskStyle === 'mask') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        
        if (titlePosition === 'center') {
          // 居中时使用固定大小的背景
          maskWidth = canvasWidth * 0.5;
          maskHeight = 100;
          ctx.fillRect((canvasWidth - maskWidth) / 2, canvasHeight / 2 - 50, maskWidth, maskHeight);
        } else {
          // 其他位置根据内容调整背景大小
          if (songTitle && authorName) {
            maskWidth = canvasWidth * 0.5;
            maskHeight = 100;
          } else {
            maskWidth = canvasWidth * 0.5;
            maskHeight = 60;
          }
          
          // 根据位置调整背景位置
          if (titlePosition === 'rightTop' || titlePosition === 'rightBottom') {
            maskX = canvasWidth - maskWidth;
          }
          
          ctx.fillRect(maskX, maskY, maskWidth, maskHeight);
        }
      }
      
      // 计算行距，固定按照主标题的字号成比例计算
      const lineHeight = Math.round(titleFontSize * 1.2); // 增加行距比例，使标题和副标题间距更大
      let authorY;
      let titleOffsetY = 0; // 标题垂直偏移量
      
      if (titlePosition === 'leftBottom' || titlePosition === 'rightBottom' || titlePosition === 'bottom') {
        // 底部位置时，作者名在标题上方
        if (songTitle && authorName) {
          titleOffsetY = lineHeight / 3; // 主标题向下偏移一点
          authorY = titleY - lineHeight; // 副标题在上方，保持固定行距
        } else {
          authorY = titleY;
        }
      } else if (titlePosition === 'center') {
        // 居中位置时，作者名在标题下方
        if (songTitle && authorName) {
          titleOffsetY = -lineHeight / 3; // 主标题向上偏移一点
          authorY = titleY + lineHeight; // 副标题在下方，保持固定行距
        } else {
          authorY = titleY;
        }
      } else {
        // 顶部位置时，作者名在标题下方
        if (songTitle && authorName) {
          authorY = titleY + lineHeight; // 副标题在下方，保持固定行距
        } else {
          authorY = titleY;
        }
      }
      
      // 绘制标题
      if (songTitle) {
        // 使用用户选择的字体，如果没有选择则使用默认字体
        const fontFamily = selectedFont ? selectedFont : '"Microsoft YaHei", Arial, sans-serif';
        ctx.font = `bold ${titleFontSize}px ${fontFamily}`;
        ctx.fillStyle = titleColor; // 使用传入的主标题颜色
        
        // 如果选择了描边样式，则添加描边
        if (lyricsStrokeStyle === 'stroke') {
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.lineWidth = 3;
          ctx.strokeText(songTitle, titleX, titleY + titleOffsetY);
        }
        
        ctx.fillText(songTitle, titleX, titleY + titleOffsetY);
      }
      
      // 绘制作者
      if (authorName) {
        // 作者名称字号为标题字号的0.75倍
        const authorFontSize = Math.round(titleFontSize * 0.75);
        
        // 使用用户选择的字体，如果没有选择则使用默认字体
        const fontFamily = selectedFont ? selectedFont : '"Microsoft YaHei", Arial, sans-serif';
        ctx.font = `normal ${authorFontSize}px ${fontFamily}`;
        ctx.fillStyle = titleSecondaryColor; // 使用传入的副标题颜色
        
        // 如果选择了描边样式，则添加描边
        if (lyricsStrokeStyle === 'stroke') {
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.lineWidth = 2;
          ctx.strokeText(authorName, titleX, authorY);
        }
        
        ctx.fillText(authorName, titleX, authorY);
      }
    }
    
    // 查找当前歌词
    let currentLyricIndex = -1;
    
    if (lyrics && lyrics.length > 0) {
      // 如果当前时间小于第一条歌词的时间，不显示任何歌词
      if (currentTime < lyrics[0].time) {
        currentLyricIndex = -1;
      } else {
        for (let i = 0; i < lyrics.length; i++) {
          if (i === lyrics.length - 1 || (currentTime >= lyrics[i].time && currentTime < lyrics[i + 1].time)) {
            currentLyricIndex = i;
            break;
          }
        }
      }
      
      // 只有在有当前歌词时才绘制歌词
      if (currentLyricIndex >= 0) {
        // 绘制歌词
        const lineHeight = 1.5 * lyricsFontSize; // 行高是字体大小的1.5倍
        
        // 根据歌词位置设置文本对齐方式和位置
        let centerX, centerY;
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (lyricsPosition === 'left') {
          ctx.textAlign = 'left';
          centerX = canvasWidth * 0.15;
          centerY = canvasHeight / 2 + lyricsOffsetY;
        } else if (lyricsPosition === 'right') {
          ctx.textAlign = 'right';
          centerX = canvasWidth * 0.85;
          centerY = canvasHeight / 2 + lyricsOffsetY;
        } else if (lyricsPosition === 'center') {
          centerX = canvasWidth / 2;
          centerY = canvasHeight / 2 + lyricsOffsetY;
        } else { // bottom
          centerX = canvasWidth / 2;
          centerY = canvasHeight - 100 + lyricsOffsetY;
        }
        
        // 根据字号设置大小
        const getFontSize = (isCurrentLyric) => {
          if (isCurrentLyric) {
            // 当前播放的歌词
            return lyricsFontSize;
          } else {
            // 非当前播放的歌词，稍微小一些
            return Math.max(16, Math.floor(lyricsFontSize * 0.8));
          }
        };
        
        // 根据颜色设置
        const getLyricsColor = (isCurrentLyric) => {
          if (isCurrentLyric) {
            // 当前播放的歌词使用用户设置的主色
            return lyricsColor;
          } else {
            // 非当前歌词使用用户设置的配色，添加透明度
            // 从配色中提取RGB值
            let r, g, b;
            
            // 处理十六进制颜色代码
            if (lyricsSecondaryColor.startsWith('#')) {
              const hex = lyricsSecondaryColor.substring(1);
              if (hex.length === 3) {
                r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
                g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
                b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
              } else if (hex.length === 6) {
                r = parseInt(hex.substring(0, 2), 16);
                g = parseInt(hex.substring(2, 4), 16);
                b = parseInt(hex.substring(4, 6), 16);
              }
            } else {
              // 默认为白色
              r = 255;
              g = 255;
              b = 255;
            }
            
            // 返回带透明度的颜色
            return `rgba(${r}, ${g}, ${b}, 0.7)`;
          }
        };
        
        try {
          if (lyricsDisplayMode === 'singleLine') {
            // 单行模式：只显示当前歌词
            if (currentLyricIndex >= 0 && currentLyricIndex < lyrics.length && lyrics[currentLyricIndex]) {
              const isCurrentLyric = true;
              const fontSize = getFontSize(isCurrentLyric);
              // 使用用户选择的字体，如果没有选择则使用默认字体
              const fontFamily = selectedFont ? selectedFont : '"Microsoft YaHei", Arial, sans-serif';
              ctx.font = `bold ${fontSize}px ${fontFamily}`;
              ctx.fillStyle = lyricsColor; // 使用主色
              
              if (lyrics[currentLyricIndex].text) {
                // 根据样式决定是否添加描边
                if (lyricsStrokeStyle === 'stroke') {
                  ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
                  ctx.lineWidth = 3;
                  ctx.strokeText(lyrics[currentLyricIndex].text, centerX, centerY);
                }
                
                ctx.fillText(lyrics[currentLyricIndex].text, centerX, centerY);
              }
            }
          } else {
            // 多行模式：显示前后几行歌词
            for (let i = Math.max(0, currentLyricIndex - 2); i < Math.min(lyrics.length, currentLyricIndex + 3); i++) {
              if (i < 0 || i >= lyrics.length || !lyrics[i]) continue;
              
              const offsetY = (i - currentLyricIndex) * lineHeight;
              const isCurrentLyric = i === currentLyricIndex;
              
              const fontSize = getFontSize(isCurrentLyric);
              // 使用用户选择的字体，如果没有选择则使用默认字体
              const fontFamily = selectedFont ? selectedFont : '"Microsoft YaHei", Arial, sans-serif';
              ctx.font = `${isCurrentLyric ? 'bold' : 'normal'} ${fontSize}px ${fontFamily}`;
              ctx.fillStyle = getLyricsColor(isCurrentLyric);
              
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
          }
        } catch (e) {
          console.error('歌词绘制错误:', e);
        }
      }
    } else {
      console.warn('没有可用的歌词数据');
    }
    
    // 检查音频是否结束，添加防御性检查
    if (audioElement && (audioElement.ended || audioElement.paused)) {
      console.log('音频播放结束或暂停，停止渲染');
      if (animationFrameIdRef && animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (mediaRecorderRef && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      return;
    }
    
    // 继续下一帧
    animationFrameIdRef.current = requestAnimationFrame(() => 
      renderFrame(
        ctx, 
        background, 
        foreground, // 添加前景图参数
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
        foregroundShape, // 添加前景图形状参数，保持原始值
        foregroundAutoRotate // 添加前景图自动旋转参数，保持原始值
      )
    );
  } catch (error) {
    console.error('渲染帧时出错:', error);
    cancelAnimationFrame(animationFrameIdRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }
};
