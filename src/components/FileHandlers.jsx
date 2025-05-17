import React from 'react';
import { analyzeMusic } from '../api/analyze';
import { useToast } from "./ToastMessage/ToastContext";

export const useFileHandlers = (
  file, 
  setFile, 
  audioUrl, 
  setAudioUrl, 
  fileInputRef, 
  setLoading, 
  setUploadProgress, 
  authorName, 
  privacyMode, 
  setRating, 
  setStats,
  setSelectedSong,
  eventTag
) => {
  const { showToast } = useToast();
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // 如果已经存在之前的 URL，先清理掉
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    // 创建文件的 URL
    const url = URL.createObjectURL(selectedFile);
    console.log('# File Changed: ', selectedFile);
    setAudioUrl(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      
      // 如果已经存在之前的 URL，先清理掉
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      // 创建文件的 URL
      const url = URL.createObjectURL(droppedFile);
      console.log('# File Dropped: ', droppedFile);
      setAudioUrl(url);
      
      // 更新 file input 的值
      if (fileInputRef.current) {
        // 创建一个新的 FileList 对象是不可能的，但我们可以使用 DataTransfer 来模拟
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleUpload = async () => {
    if (!file) {
      showToast('请选择音频文件', 'error');
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    try {
      const response = await analyzeMusic(file, authorName, (progress) => {
        setUploadProgress(progress);
      }, privacyMode, eventTag);
      if (response) {
        // 将分析结果保存到 rating 中（为了兼容现有代码）
        setRating(response.data);
        
        // 更新统计数据
        setStats(prev => ({
          ...prev,
          analyses: prev.analyses + 1
        }));
        
        // 将分析结果存入localStorage
        localStorage.setItem('tempSongDetail', JSON.stringify(response.data));
        
        // 创建链接URL
        const songDetailUrl = `/song/${response.data._id}?local=true`;
        
        // 创建一个全屏模态框元素
        const modalElement = document.createElement('div');
        modalElement.style.position = 'fixed';
        modalElement.style.top = '0';
        modalElement.style.left = '0';
        modalElement.style.width = '100%';
        modalElement.style.height = '100%';
        modalElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        modalElement.style.display = 'flex';
        modalElement.style.justifyContent = 'center';
        modalElement.style.alignItems = 'center';
        modalElement.style.zIndex = '9999';
        
        // 创建模态框内容
        const modalContent = document.createElement('div');
        modalContent.style.width = '400px';
        modalContent.style.backgroundColor = 'white';
        modalContent.style.borderRadius = '12px';
        modalContent.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
        modalContent.style.padding = '30px';
        modalContent.style.textAlign = 'center';
        modalContent.style.animation = 'fadeIn 0.3s';
        
        // 添加CSS动画
        const style = document.createElement('style');
        style.textContent = `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `;
        document.head.appendChild(style);
        
        // 添加成功图标
        const successIcon = document.createElement('div');
        successIcon.innerHTML = `<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="40" fill="#6B66FF" opacity="0.1"/>
          <path d="M54 34L36 52L26 42" stroke="#6B66FF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        successIcon.style.marginBottom = '20px';
        successIcon.style.display = 'flex';
        successIcon.style.justifyContent = 'center';
        
        // 添加标题
        const title = document.createElement('h2');
        title.textContent = '分析完成!';
        title.style.fontSize = '24px';
        title.style.fontWeight = 'bold';
        title.style.margin = '0 0 15px 0';
        title.style.color = '#333';
        
        // 添加描述
        const description = document.createElement('p');
        description.textContent = '您的音乐已成功分析，点击下方按钮查看详细分析结果。';
        description.style.fontSize = '16px';
        description.style.color = '#666';
        description.style.margin = '0 0 25px 0';
        description.style.lineHeight = '1.5';
        
        // 添加按钮
        const button = document.createElement('a');
        button.href = songDetailUrl;
        button.target = '_blank';
        button.rel = 'noopener noreferrer';
        button.textContent = '查看详细分析';
        button.style.display = 'inline-block';
        button.style.backgroundColor = '#6B66FF';
        button.style.color = 'white';
        button.style.padding = '12px 24px';
        button.style.borderRadius = '30px';
        button.style.textDecoration = 'none';
        button.style.fontWeight = 'bold';
        button.style.fontSize = '16px';
        button.style.boxShadow = '0 4px 10px rgba(107, 102, 255, 0.3)';
        button.style.transition = 'all 0.3s ease';
        button.style.animation = 'pulse 2s infinite';
        button.style.cursor = 'pointer';
        
        // 鼠标悬停效果
        button.onmouseover = () => {
          button.style.backgroundColor = '#5550E6';
          button.style.transform = 'translateY(-2px)';
          button.style.boxShadow = '0 6px 12px rgba(107, 102, 255, 0.4)';
        };
        button.onmouseout = () => {
          button.style.backgroundColor = '#6B66FF';
          button.style.transform = 'translateY(0)';
          button.style.boxShadow = '0 4px 10px rgba(107, 102, 255, 0.3)';
        };
        
        // 添加关闭按钮
        const closeButton = document.createElement('div');
        closeButton.innerHTML = '&times;';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '15px';
        closeButton.style.right = '20px';
        closeButton.style.fontSize = '24px';
        closeButton.style.color = '#999';
        closeButton.style.cursor = 'pointer';
        closeButton.style.transition = 'color 0.3s ease';
        closeButton.onmouseover = () => { closeButton.style.color = '#333'; };
        closeButton.onmouseout = () => { closeButton.style.color = '#999'; };
        closeButton.onclick = () => { document.body.removeChild(modalElement); };
        
        // 点击按钮后关闭模态框
        button.onclick = () => {
          document.body.removeChild(modalElement);
        };
        
        // 组装模态框
        modalContent.style.position = 'relative';
        modalContent.appendChild(successIcon);
        modalContent.appendChild(title);
        modalContent.appendChild(description);
        modalContent.appendChild(button);
        modalContent.appendChild(closeButton);
        modalElement.appendChild(modalContent);
        
        // 添加到页面
        document.body.appendChild(modalElement);
        
        console.log('# Provided song detail link for user to click');
      }
    } catch (error) {
      console.error('分析失败:', error);
      const errorMessage = error.response?.data?.error || error.message || '分析失败';
      errorMessage && showToast(errorMessage, 'error', 60000);
    }
    setLoading(false);
    setUploadProgress(0);
  };

  return {
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleUpload
  };
};

export default useFileHandlers;
