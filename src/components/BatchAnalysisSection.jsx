import React, { useState, useEffect } from 'react';
import { RiFileUploadLine, RiMusicLine, RiCloseLine, RiMusic2Line, RiDownload2Line, RiCheckLine, RiErrorWarningLine, RiRefreshLine, RiAwardLine } from 'react-icons/ri';
import { analyzeMusic } from '../api/analyze';
import { SongDetail } from './SongDetail';

const BatchAnalysisSection = ({ 
  authorName, 
  privacyMode, 
  loading,
  uploadProgress,
  setAuthorName, 
  setPrivacyMode,
  eventTag,
  setEventTag
}) => {
  // 批量文件状态
  const [batchFiles, setBatchFiles] = useState([]);
  // 文件时长状态
  const [fileDurations, setFileDurations] = useState({});
  // 分析结果状态
  const [analysisResults, setAnalysisResults] = useState({});
  // 文件状态管理
  const [fileStatuses, setFileStatuses] = useState({});
  // 上传进度管理
  const [fileProgress, setFileProgress] = useState({});
  // 批量分析加载状态
  const [batchLoading, setBatchLoading] = useState(false);
  // 当前正在处理的文件数量
  const [processingCount, setProcessingCount] = useState(0);
  // 选中的歌曲详情
  const [selectedSong, setSelectedSong] = useState(null);
  
  // 处理批量文件选择
  const handleBatchFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setBatchFiles(prev => [...prev, ...filesArray]);
      
      // 为每个新文件获取时长
      filesArray.forEach(file => {
        getAudioDuration(file);
        // 初始化文件状态
        setFileStatuses(prev => ({
          ...prev,
          [file.name]: '待分析'
        }));
      });
    }
  };
  
  // 处理文件拖放
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setBatchFiles(prev => [...prev, ...droppedFiles]);
      
      // 为每个新文件获取时长
      droppedFiles.forEach(file => {
        getAudioDuration(file);
        // 初始化文件状态
        setFileStatuses(prev => ({
          ...prev,
          [file.name]: '待分析'
        }));
      });
    }
  };
  
  // 处理拖放悬停
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // 可以添加一些视觉效果，如改变边框颜色等
    if (e.currentTarget.classList.contains('file-upload')) {
      e.currentTarget.style.borderColor = '#6B66FF';
      e.currentTarget.style.backgroundColor = 'rgba(107, 102, 255, 0.05)';
    }
  };
  
  // 处理拖放离开
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // 恢复原来的样式
    if (e.currentTarget.classList.contains('file-upload')) {
      e.currentTarget.style.borderColor = '#e2e8f0';
      e.currentTarget.style.backgroundColor = '#f8fafc';
    }
  };
  
  // 获取音频文件时长
  const getAudioDuration = (file) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    
    audio.addEventListener('loadedmetadata', () => {
      // 格式化时长为分:秒格式
      const duration = audio.duration;
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      const formattedDuration = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
      
      setFileDurations(prev => ({
        ...prev,
        [file.name]: formattedDuration
      }));
      
      // 清理URL
      URL.revokeObjectURL(url);
    });
    
    audio.addEventListener('error', () => {
      setFileDurations(prev => ({
        ...prev,
        [file.name]: '无法获取'
      }));
      URL.revokeObjectURL(url);
    });
    
    audio.src = url;
  };
  
  // 删除批量文件
  const removeBatchFile = (index) => {
    const fileToRemove = batchFiles[index];
    if (fileToRemove) {
      // 如果文件正在处理中，不允许删除
      if (fileStatuses[fileToRemove.name] === '分析中...' || 
          (fileStatuses[fileToRemove.name] && fileStatuses[fileToRemove.name].includes('上传'))) {
        alert('正在处理的文件不能删除');
        return;
      }
      
      setBatchFiles(prev => prev.filter((_, i) => i !== index));
      
      // 清理相关状态
      const newFileDurations = { ...fileDurations };
      const newFileStatuses = { ...fileStatuses };
      const newFileProgress = { ...fileProgress };
      const newAnalysisResults = { ...analysisResults };
      
      delete newFileDurations[fileToRemove.name];
      delete newFileStatuses[fileToRemove.name];
      delete newFileProgress[fileToRemove.name];
      delete newAnalysisResults[fileToRemove.name];
      
      setFileDurations(newFileDurations);
      setFileStatuses(newFileStatuses);
      setFileProgress(newFileProgress);
      setAnalysisResults(newAnalysisResults);
    }
  };

  // 清空所有文件
  const clearAllFiles = () => {
    // 检查是否有正在处理的文件
    const hasProcessingFiles = Object.values(fileStatuses).some(
      status => status === '分析中...' || (status && status.includes('上传'))
    );
    
    if (hasProcessingFiles) {
      alert('有文件正在处理中，无法清空');
      return;
    }
    
    setBatchFiles([]);
    setFileDurations({});
    setFileStatuses({});
    setFileProgress({});
    setAnalysisResults({});
  };
  
  // 分析单个文件
  const analyzeFile = async (file) => {
    // 更新文件状态为上传中，初始进度为0%
    setFileStatuses(prev => ({
      ...prev,
      [file.name]: '上传...(0%)'
    }));
    setFileProgress(prev => ({
      ...prev,
      [file.name]: 0
    }));
    
    try {
      // 调用分析API
      const response = await analyzeMusic(
        file, 
        authorName, 
        (progress) => {
          // 更新上传进度
          setFileProgress(prev => ({
            ...prev,
            [file.name]: progress
          }));
          
          // 当进度达到100%时，自动转换状态为"分析中..."
          if (progress >= 100) {
            setFileStatuses(prev => ({
              ...prev,
              [file.name]: '分析中...'
            }));
          } else {
            setFileStatuses(prev => ({
              ...prev,
              [file.name]: `上传...(${progress}%)`
            }));
          }
        }, 
        privacyMode,
        eventTag
      );
      
      // 存储分析结果
      if (response && response.data) {
        setAnalysisResults(prev => ({
          ...prev,
          [file.name]: response.data
        }));
        
        // 更新状态为完成
        setFileStatuses(prev => ({
          ...prev,
          [file.name]: '完成'
        }));
      }
      
      return true;
    } catch (error) {
      console.error(`分析失败: ${file.name}`, error);
      
      // 更新状态为失败
      setFileStatuses(prev => ({
        ...prev,
        [file.name]: '失败'
      }));
      
      return false;
    } finally {
      // 减少处理中的文件数量
      setProcessingCount(prev => prev - 1);
    }
  };
  
  // 开始批量分析
  const startBatchAnalysis = async () => {
    if (batchFiles.length === 0) {
      alert('请先选择文件');
      return;
    }
    
    setBatchLoading(true);
    
    // 获取待分析的文件
    const pendingFiles = batchFiles.filter(file => 
      fileStatuses[file.name] === '待分析' || 
      fileStatuses[file.name] === '失败'
    );
    
    if (pendingFiles.length === 0) {
      alert('没有需要分析的文件');
      setBatchLoading(false);
      return;
    }
    
    // 并行处理文件，最多同时处理5个
    const MAX_PARALLEL = 5;
    let currentIndex = 0;
    
    const processNextBatch = async () => {
      // 计算当前批次需要处理的文件数量
      const remainingFiles = pendingFiles.length - currentIndex;
      const batchSize = Math.min(MAX_PARALLEL - processingCount, remainingFiles);
      
      if (batchSize <= 0 || currentIndex >= pendingFiles.length) {
        // 所有文件都已经开始处理
        return;
      }
      
      // 获取当前批次的文件
      const currentBatch = pendingFiles.slice(currentIndex, currentIndex + batchSize);
      currentIndex += batchSize;
      
      // 更新处理中的文件数量
      setProcessingCount(prev => prev + currentBatch.length);
      
      // 并行处理当前批次的文件
      await Promise.all(currentBatch.map(file => analyzeFile(file)));
      
      // 处理下一批文件
      await processNextBatch();
    };
    
    try {
      await processNextBatch();
    } finally {
      // 所有文件处理完成
      setBatchLoading(false);
    }
  };

  // 模拟分析结果数据
  const mockAnalysisResults = batchFiles.map((file, index) => {
    // 获取分析结果中的评分 (使用overall_score字段)
    const score = analysisResults[file.name]?.overall_score || '-';
    
    return {
      id: index,
      fileName: file.name,
      fileSize: (file.size / (1024 * 1024)).toFixed(2),
      status: fileStatuses[file.name] || '待分析',
      score: score,
      duration: fileDurations[file.name] || '加载中...',
      result: analysisResults[file.name] || null
    };
  });
  
  // 将分析结果转换为CSV格式
  const convertToCSV = (data) => {
    // CSV表头
    const headers = ['ID', '文件名', '大小(MB)', '状态', '评分', '时长', '评价'];
    
    // 转换数据行
    const rows = data.map(item => {
      // 获取评价内容（如果存在）
      const comments = item.result?.comments || '';
      
      return [
        item.id,
        item.fileName,
        item.fileSize,
        item.status,
        item.score,
        item.duration,
        // 处理评价内容中可能存在的逗号，用引号包裹以避免CSV格式错误
        `"${comments && typeof comments === 'string' ? comments.replace(/"/g, '""') : ''}"`
      ];
    });
    
    // 合并表头和数据行
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  };
  
  // 下载CSV文件
  const downloadCSV = () => {
    // 转换数据为CSV
    const csvContent = convertToCSV(mockAnalysisResults);
    
    // 添加UTF-8 BOM标记，解决中文乱码问题
    const BOM = '\uFEFF';
    const csvContentWithBOM = BOM + csvContent;
    
    // 创建Blob对象，指定UTF-8编码
    const blob = new Blob([csvContentWithBOM], { type: 'text/csv;charset=utf-8;' });
    
    // 创建下载链接
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // 设置下载属性
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.setAttribute('href', url);
    link.setAttribute('download', `音乐分析结果_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    // 添加到文档并触发点击
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 获取状态样式
  const getStatusStyle = (status) => {
    if (status === '完成') {
      return {
        color: '#10B981', // 绿色
        icon: <RiCheckLine style={{ marginRight: '4px' }} />
      };
    } else if (status === '失败') {
      return {
        color: '#EF4444', // 红色
        icon: <RiErrorWarningLine style={{ marginRight: '4px' }} />
      };
    } else if (status === '分析中...' || status.includes('上传')) {
      return {
        color: '#6B66FF', // 紫色
        icon: null
      };
    } else {
      return {
        color: '#4B5563', // 灰色
        icon: null
      };
    }
  };

  // 处理点击表格行
  const handleRowClick = (item) => {
    console.log('item', item);
    // 只有当状态为"完成"时才显示详情
    if (item.status === '完成' && item.result) {
      // 格式化数据以适配SongDetail组件的需求
      const formattedSong = {
        ...item.result,
        _id: item.id.toString(), // 使用id作为_id
        url: item.result?.url || '', // 使用文件名作为url
        song_name: item.fileName // 使用文件名作为歌曲名
      };
      
      setSelectedSong(formattedSong);
    }
  };

  // 关闭歌曲详情
  const handleCloseDetail = () => {
    setSelectedSong(null);
  };

  // 重新分析单个文件
  const handleRetryAnalysis = async (file, index) => {
    // 防止事件冒泡到表格行
    event.stopPropagation();
    
    // 如果当前正在处理的文件数量已达到最大值，则提示用户
    if (processingCount >= 5) {
      alert('当前正在处理的文件数量已达上限，请稍后重试');
      return;
    }
    
    // 重置文件状态
    setFileStatuses(prev => ({
      ...prev,
      [file.name]: '待分析'
    }));
    
    // 清除之前的分析结果
    const newAnalysisResults = { ...analysisResults };
    delete newAnalysisResults[file.name];
    setAnalysisResults(newAnalysisResults);
    
    // 增加处理中的文件数量
    setProcessingCount(prev => prev + 1);
    
    // 开始分析
    await analyzeFile(file);
  };

  return (
    <section className="batch-analysis-section" style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      padding: '24px',
      marginBottom: '24px',
      minHeight: '600px'
    }}>
      <div className="batch-header">
        <h2>批量分析</h2>
        <p style={{ color: '#666', marginTop: '8px' }}>
          一次上传多个音频文件进行批量分析，提高工作效率
        </p>
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: '20px',
        marginBottom: '20px'
      }}>
        <div>
          <button 
            className="batch-upload-button"
            onClick={() => document.getElementById('batch-file-input').click()}
            style={{
              backgroundColor: '#6B66FF',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
          >
            <RiFileUploadLine style={{ fontSize: '1.2rem' }} />
            选择音频文件
          </button>
          <input
            id="batch-file-input"
            type="file"
            accept=".mp3,audio/*"
            multiple
            onChange={handleBatchFileChange}
            style={{ display: 'none' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div>
            <input
              type="text"
              placeholder="作者名称（可选）"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
            />
          </div>
          
          <div className="privacy-mode" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="checkbox"
              id="batch-privacy-mode"
              checked={privacyMode}
              onChange={(e) => setPrivacyMode(e.target.checked)}
            />
            <label htmlFor="batch-privacy-mode" style={{ whiteSpace: 'nowrap' }}>隐私模式</label>
          </div>
        </div>
      </div>
      
      {batchFiles.length > 0 ? (
        <>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h3>已选择 {batchFiles.length} 个文件</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              {mockAnalysisResults.length > 0 && (
                <button 
                  onClick={downloadCSV}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'transparent',
                    border: '1px solid #6B66FF',
                    color: '#6B66FF',
                    borderRadius: '4px',
                    padding: '4px 10px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <RiDownload2Line style={{ fontSize: '1rem' }} />
                  导出CSV
                </button>
              )}
              <button 
                onClick={clearAllFiles}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#6B66FF',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                清空所有
              </button>
            </div>
          </div>
          
          <div className="batch-files-table" style={{ 
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '0.9rem'
            }}>
              <thead>
                <tr style={{ 
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 'bold' }}>序号</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 'bold' }}>文件名</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 'bold' }}>大小</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 'bold' }}>状态</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 'bold' }}>评分</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 'bold' }}>时长</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 'bold' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {mockAnalysisResults.map((item, index) => (
                  <tr 
                    key={index} 
                    style={{ 
                      borderBottom: index === mockAnalysisResults.length - 1 ? 'none' : '1px solid #e2e8f0',
                      cursor: item.status === '完成' ? 'pointer' : 'default',
                      backgroundColor: item.status === '完成' ? 'rgba(107, 102, 255, 0.03)' : 'transparent',
                      transition: 'background-color 0.2s ease'
                    }}
                    onClick={() => handleRowClick(item)}
                  >
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>{index + 1}</td>
                    <td style={{ 
                      padding: '12px 16px', 
                      maxWidth: '300px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <RiMusicLine style={{ color: '#6B66FF' }} />
                        {item.fileName}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.fileSize} MB</td>
                    <td style={{ 
                      padding: '12px 16px', 
                      textAlign: 'center',
                      color: getStatusStyle(item.status).color,
                      fontWeight: item.status === '完成' || item.status === '失败' ? 'bold' : 'normal'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {getStatusStyle(item.status).icon}
                        {item.status}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.score}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.duration}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        {(item.status === '失败' || item.status === '完成') && (
                          <button 
                            onClick={(e) => handleRetryAnalysis(batchFiles[index], index)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#6B66FF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title={item.status === '失败' ? '重新分析' : '重新分析以获得更好的评分'}
                          >
                            <RiRefreshLine style={{ fontSize: '1.2rem' }} />
                          </button>
                        )}
                        
                        <button 
                          onClick={() => removeBatchFile(index)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6B66FF',
                            opacity: item.status === '分析中...' || item.status.includes('上传') ? 0.5 : 1
                          }}
                          title="移除文件"
                          disabled={item.status === '分析中...' || item.status.includes('上传')}
                        >
                          <RiCloseLine style={{ fontSize: '1.2rem' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button 
            className="analyze-button"
            disabled={batchFiles.length === 0 || batchLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '14px',
              backgroundColor: '#6B66FF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: batchFiles.length === 0 || batchLoading ? 'not-allowed' : 'pointer',
              opacity: batchFiles.length === 0 || batchLoading ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
            onClick={startBatchAnalysis}
          >
            <RiMusic2Line style={{ fontSize: '1.2rem' }} />
            {batchLoading ? '分析中...' : '开始批量分析'}
          </button>
        </>
      ) : (
        <div 
          className="file-upload animated-icon"
          onClick={() => document.getElementById('batch-file-input').click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{ 
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #e2e8f0',
            borderRadius: '8px',
            padding: '60px 20px',
            marginTop: '20px',
            backgroundColor: '#f8fafc',
            transition: 'all 0.2s ease'
          }}
        >
          <RiFileUploadLine style={{ fontSize: '3rem', marginBottom: '16px', color: '#6B66FF' }} />
          <h3>选择多个音频文件</h3>
          <p style={{ color: '#666', marginTop: '8px' }}>支持 MP3、WAV 和 MP4 等格式</p>
          <p style={{ color: '#666', marginTop: '4px' }}>点击或拖拽文件到此处</p>
        </div>
      )}

<div className="event-selection" style={{ 
            display: 'flex',
            marginTop: '20px',
            alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(240,240,255,0.8) 100%)',
            padding: '6px 10px',
            borderRadius: '6px',
            boxShadow: '0 2px 10px rgba(107, 102, 255, 0.1)',
            border: '1px solid rgba(107, 102, 255, 0.2)'
          }}>
            <RiAwardLine style={{ 
              fontSize: '1.2rem', 
              color: '#FF6B66', 
              marginRight: '8px',
              filter: 'drop-shadow(0 0 2px rgba(255, 107, 102, 0.3))'
            }} />
            <label htmlFor="event-select" style={{ 
              fontWeight: 'bold', 
              marginRight: '10px',
              color: '#444',
              flexShrink: 0
            }}>
              参与活动：
            </label>
            <select 
              id="batch-event-select"
              value={eventTag}
              onChange={(e) => setEventTag(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--border-radius)',
                border: '1px solid #d1d5db',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                background: 'linear-gradient(to right, #fff, #f8f8ff)',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.7rem top 50%',
                backgroundSize: '0.65rem auto',
                paddingRight: '2rem'
              }}
            >
              <option value="">不参加活动</option>
              <option value="sanguoyanyi" style={{ 
                background: 'linear-gradient(45deg, #FFD700, #FFA500)', 
                fontWeight: 'bold',
                color: '#8B4513'
              }}>AI音乐达人《三国演义》共创盛典</option>
              <option value="xiyouji" style={{ 
                background: 'linear-gradient(45deg, #FFD700, #FFA500)', 
                fontWeight: 'bold',
                color: '#8B4513'
              }}>AI音乐达人《西游记》共创盛典</option>
            </select>
          </div>

      {loading && (
        <div style={{ marginTop: '1rem', width: '100%' }}>
          <div style={{ 
            width: '100%', 
            height: '6px', 
            backgroundColor: 'rgba(107, 102, 255, 0.1)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${uploadProgress}%`,
              height: '100%',
              background: 'var(--primary-gradient)',
              transition: 'width 0.3s ease-in-out'
            }} />
          </div>
          <div style={{ 
            textAlign: 'center', 
            marginTop: '0.5rem',
            fontSize: '0.9rem',
            color: '#4A5568'
          }}>
            上传进度：{uploadProgress}%
          </div>
        </div>
      )}
      
      {/* 歌曲详情弹窗 */}
      {selectedSong && (
        <SongDetail 
          selectedSong={selectedSong} 
          onClose={handleCloseDetail} 
        />
      )}
    </section>
  );
};

export default BatchAnalysisSection;
