import React, { useState } from 'react';
import { RiFileUploadLine, RiMusicLine, RiCloseLine, RiMusic2Line } from 'react-icons/ri';

const BatchAnalysisSection = ({ 
  authorName, 
  privacyMode, 
  loading,
  uploadProgress,
  setAuthorName, 
  setPrivacyMode 
}) => {
  // 批量文件状态
  const [batchFiles, setBatchFiles] = useState([]);
  
  // 处理批量文件选择
  const handleBatchFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setBatchFiles(prev => [...prev, ...filesArray]);
    }
  };
  
  // 删除批量文件
  const removeBatchFile = (index) => {
    setBatchFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 清空所有文件
  const clearAllFiles = () => {
    setBatchFiles([]);
  };

  // 模拟分析结果数据
  const mockAnalysisResults = batchFiles.map((file, index) => ({
    id: index,
    fileName: file.name,
    fileSize: (file.size / (1024 * 1024)).toFixed(2),
    status: '待分析',
    score: '-',
    duration: '-',
    dateAdded: new Date().toLocaleString()
  }));

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
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 'bold' }}>文件名</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 'bold' }}>大小</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 'bold' }}>状态</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 'bold' }}>评分</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 'bold' }}>时长</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 'bold' }}>添加时间</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 'bold' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {mockAnalysisResults.map((item, index) => (
                  <tr key={index} style={{ 
                    borderBottom: index === mockAnalysisResults.length - 1 ? 'none' : '1px solid #e2e8f0'
                  }}>
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
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.status}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.score}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.duration}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.dateAdded}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button 
                        onClick={() => removeBatchFile(index)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#6B66FF'
                        }}
                        title="移除文件"
                      >
                        <RiCloseLine style={{ fontSize: '1.2rem' }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button 
            className="analyze-button"
            disabled={batchFiles.length === 0 || loading}
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
              cursor: batchFiles.length === 0 || loading ? 'not-allowed' : 'pointer',
              opacity: batchFiles.length === 0 || loading ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
            onClick={() => alert('批量分析功能即将上线，敬请期待！')}
          >
            <RiMusic2Line style={{ fontSize: '1.2rem' }} />
            {loading ? '分析中...' : '开始批量分析'}
          </button>
        </>
      ) : (
        <div 
          className="file-upload animated-icon"
          onClick={() => document.getElementById('batch-file-input').click()}
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
    </section>
  );
};

export default BatchAnalysisSection;
