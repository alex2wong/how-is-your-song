/**
 * 检查浏览器是否支持指定的媒体格式
 * @param {string} mimeType - 要检查的MIME类型
 * @returns {boolean} - 是否支持该格式
 */
export const isFormatSupported = (mimeType) => {
  try {
    return MediaRecorder.isTypeSupported(mimeType);
  } catch (error) {
    console.error('检查媒体格式支持时出错:', error);
    return false;
  }
};

/**
 * 处理音乐文件选择
 * @param {Event} e - 文件选择事件
 * @param {Function} setSelectedMusic - 设置选中音乐的状态函数
 * @param {HTMLAudioElement} audioElement - 音频元素
 */
export const handleMusicFileChange = (e, setSelectedMusic, audioElement) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    
    // 先清除旧的音频URL
    if (audioElement.src) {
      URL.revokeObjectURL(audioElement.src);
    }
    
    // 创建新的音频URL
    const audioUrl = URL.createObjectURL(file);
    audioElement.src = audioUrl;
    
    // 确保音频已加载
    audioElement.load();
    
    // 设置选中的音乐文件
    setSelectedMusic(file);
    
    console.log('音频文件已选择:', file.name, '音频URL:', audioUrl);
  }
};

/**
 * 清除选择的音乐文件
 * @param {HTMLAudioElement} audioElement - 音频元素
 * @param {Function} setSelectedMusic - 设置选中音乐的状态函数
 * @param {React.RefObject} musicInputRef - 音乐输入框的引用
 */
export const handleClearMusic = (audioElement, setSelectedMusic, musicInputRef) => {
  if (audioElement.src) {
    URL.revokeObjectURL(audioElement.src);
    audioElement.src = '';
  }
  setSelectedMusic(null);
  if (musicInputRef.current) {
    musicInputRef.current.value = '';
  }
};

/**
 * 处理背景选择（支持图片和视频）
 * @param {Event} e - 文件选择事件
 * @param {Function} setBackgroundImage - 设置背景的状态函数
 */
export const handleBackgroundChange = (e, setBackgroundImage) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    const fileType = file.type;
    
    // 判断文件类型是图片还是视频
    const isImage = fileType.startsWith('image/');
    const isVideo = fileType.startsWith('video/');
    
    if (isImage || isVideo) {
      setBackgroundImage({
        file: file,
        preview: URL.createObjectURL(file),
        type: isImage ? 'image' : 'video',
        duration: null // 视频时长，后续会获取
      });
      
      // 如果是视频，获取其时长
      if (isVideo) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          setBackgroundImage(prev => ({
            ...prev,
            duration: video.duration
          }));
        };
        video.src = URL.createObjectURL(file);
      }
    }
  }
};

/**
 * 清除选择的背景
 * @param {Object} backgroundImage - 背景对象
 * @param {Function} setBackgroundImage - 设置背景的状态函数
 * @param {React.RefObject} imageInputRef - 背景输入框的引用
 */
export const handleClearBackground = (backgroundImage, setBackgroundImage, imageInputRef) => {
  if (backgroundImage && backgroundImage.preview) {
    URL.revokeObjectURL(backgroundImage.preview);
  }
  setBackgroundImage(null);
  if (imageInputRef.current) {
    imageInputRef.current.value = '';
  }
};
