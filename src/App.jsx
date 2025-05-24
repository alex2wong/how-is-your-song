import React, { useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchApi } from './utils/api';
import './App.css';
import './components/Auth/auth.css';

// Import modular components
import Header from './components/Header';
import BottomPlayer from './components/BottomPlayer';
import { BottomPlayerProvider } from './components/BottomPlayer/BottomPlayerContext';
import { AuthProvider, useAuth } from './components/Auth/AuthContext';
import ApiInterceptor from './components/Auth/ApiInterceptor';
import UploadSection from './components/UploadSection';
import BatchAnalysisSection from './components/BatchAnalysisSection';
import AnalysisResult from './components/AnalysisResult';
import SearchSection from './components/SearchSection';
import RankingSection from './components/RankingSection';
import Stats from './components/Stats';
import { ProjectIntro } from './components/ProjectIntro';
import { SongDetail } from './components/SongDetail';
import InstructionsSection from './components/InstructionsSection';
import MVGenerationSection from './components/MVGenerationSection';

// Import custom hooks
import { useAppState } from './components/AppState';
import { useFileHandlers } from './components/FileHandlers';
import { useRankingUtils } from './components/RankingUtils';
import { useRankTabLogic } from './components/RankTabLogic';

// App组件

function App() {
  // Wrap the entire app with providers
  return (
    <AuthProvider>
      <BottomPlayerProvider>
        <AppContent />
      </BottomPlayerProvider>
      {/* 将ApiInterceptor放在这里，确保它能访问ToastContext */}
      <ApiInterceptor />
    </AuthProvider>
  );
}

function AppContent() {
  // 添加顶层Tab状态
  const [activeMainTab, setActiveMainTab] = useState('single');
  const [searchParams] = useSearchParams();
  
  // 添加事件监听器，处理从歌曲详情页切换到MV生成页面的事件
  useEffect(() => {
    const handleSwitchToMVTab = () => {
      setActiveMainTab('mv');
    };
    
    // 添加事件监听
    window.addEventListener('switchToMVTab', handleSwitchToMVTab);
    
    // 组件卸载时移除事件监听
    return () => {
      window.removeEventListener('switchToMVTab', handleSwitchToMVTab);
    };
  }, []);

  // Initialize app state
  const {
    file, setFile,
    userLyrics, setUserLyrics,
    rating, setRating,
    loading, setLoading,
    audioUrl, setAudioUrl,
    stats, setStats,
    uploadProgress, setUploadProgress,
    selectedSong, setSelectedSong,
    searchQuery,
    searchResults,
    authorName, setAuthorName,
    privacyMode, setPrivacyMode,
    rankList, setRankList,
    activeRankTab, setActiveRankTab,
    rankLoading, setRankLoading,
    searchLoading,
    handleInputChange
  } = useAppState();
  
  // 添加活动标签状态
  const [eventTag, setEventTag] = useState('');

  const fileInputRef = useRef(null);

  // Initialize file handlers
  const {
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleUpload
  } = useFileHandlers(
    file, 
    setFile, 
    userLyrics,
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
  );

  // Initialize ranking utilities
  const { fetchRankList, fetchSongDetail } = useRankingUtils();

  // Use rank tab logic
  useRankTabLogic(activeRankTab, setRankLoading, setRankList, fetchRankList);

// 处理URL参数，设置榜单激活状态并滚动到榜单位置
useEffect(() => {
  const tab = searchParams.get('tab');
  if (tab) {
    setActiveMainTab('single');
    setActiveRankTab(tab);
  }
}, [searchParams, setActiveRankTab]);

  return (
    <div className="app">
      <Header />
      
      {/* 顶层Tab导航 */}
      <div className="main-tab-navigation" style={{ 
        display: 'flex', 
        justifyContent: 'center',
        marginBottom: '24px', 
        marginTop: '16px'
      }}>
        <div style={{
          display: 'flex',
          backgroundColor: '#f1f5f9',
          borderRadius: '8px',
          padding: '4px',
        }}>
          <button 
            className={`main-tab-button ${activeMainTab === 'single' ? 'active-main-tab' : ''}`}
            onClick={() => setActiveMainTab('single')}
            style={{ 
              padding: '10px 20px', 
              background: activeMainTab === 'single' ? '#6B66FF' : 'transparent', 
              border: 'none', 
              borderRadius: '6px',
              color: activeMainTab === 'single' ? 'white' : '#4A5568',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '120px'
            }}
          >
            音乐智能分析系统
          </button>
          <button 
            className={`main-tab-button ${activeMainTab === 'batch' ? 'active-main-tab' : ''}`}
            onClick={() => setActiveMainTab('batch')}
            style={{ 
              padding: '10px 20px', 
              background: activeMainTab === 'batch' ? '#6B66FF' : 'transparent', 
              border: 'none', 
              borderRadius: '6px',
              color: activeMainTab === 'batch' ? 'white' : '#4A5568',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '120px'
            }}
          >
            批量分析
          </button>
          <button 
            className={`main-tab-button ${activeMainTab === 'mv' ? 'active-main-tab' : ''}`}
            onClick={() => setActiveMainTab('mv')}
            style={{ 
              padding: '10px 20px', 
              background: activeMainTab === 'mv' ? '#6B66FF' : 'transparent', 
              border: 'none', 
              borderRadius: '6px',
              color: activeMainTab === 'mv' ? 'white' : '#4A5568',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '120px'
            }}
          >
            一键MV生成
          </button>
        </div>
      </div>
      
      {/* 单曲分析Tab内容 */}
      {activeMainTab === 'single' && (
        <>
          <UploadSection 
            file={file}
            userLyrics={userLyrics}
            setUserLyrics={setUserLyrics}
            audioUrl={audioUrl}
            loading={loading}
            uploadProgress={uploadProgress}
            authorName={authorName}
            privacyMode={privacyMode}
            fileInputRef={fileInputRef}
            handleDrop={handleDrop}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleFileChange={handleFileChange}
            handleUpload={handleUpload}
            setAuthorName={setAuthorName}
            setPrivacyMode={setPrivacyMode}
            setFile={setFile}
            setAudioUrl={setAudioUrl}
            eventTag={eventTag}
            setEventTag={setEventTag}
          />
          
          <InstructionsSection />
          
          <SearchSection 
            searchQuery={searchQuery}
            searchResults={searchResults}
            searchLoading={searchLoading}
            handleInputChange={handleInputChange}
            fetchSongDetail={(id) => fetchSongDetail(id, setSelectedSong)}
          />

          <RankingSection 
            activeRankTab={activeRankTab}
            setActiveRankTab={setActiveRankTab}
            rankList={rankList}
            rankLoading={rankLoading}
            fetchSongDetail={(id) => fetchSongDetail(id, setSelectedSong)}
          />
        </>
      )}
      
      {/* 批量分析Tab内容 */}
      {activeMainTab === 'batch' && (
        <div style={{ 
          padding: '0', 
          backgroundColor: 'white', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            background: 'var(--primary-gradient)', 
            height: '6px', 
            width: '100%' 
          }}></div>
          <div style={{ padding: '0' }}>
            <BatchAnalysisSection
              authorName={authorName}
              privacyMode={privacyMode}
              loading={loading}
              uploadProgress={uploadProgress}
              setAuthorName={setAuthorName}
              setPrivacyMode={setPrivacyMode}
              eventTag={eventTag}
              setEventTag={setEventTag}
            />
          </div>
        </div>
      )}
      
      {/* 一键MV生成Tab内容 */}
      {activeMainTab === 'mv' && (
        <MVGenerationSection />
      )}

      {selectedSong && <SongDetail selectedSong={selectedSong} onClose={() => setSelectedSong(null)} />}

      <Stats stats={stats} />
      <BottomPlayer />
    </div>
  );
}

export default App;
