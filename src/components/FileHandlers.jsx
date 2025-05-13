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
        
        // 将分析结果设置为 selectedSong，这样会自动在 SongDetail 窗口中显示
        setSelectedSong(response.data);
      }
    } catch (error) {
      console.error('分析失败:', error);
      const errorMessage = error.response?.data?.error || error.message || '分析失败';
      errorMessage && showToast(errorMessage, 'error');
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
