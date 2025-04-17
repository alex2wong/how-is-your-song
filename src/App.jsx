import React, { useRef, useState } from 'react';
import './App.css';

// Import modular components
import Header from './components/Header';
import BottomPlayer from './components/BottomPlayer';
import { BottomPlayerProvider } from './components/BottomPlayer/BottomPlayerContext';
import UploadSection from './components/UploadSection';
import BatchAnalysisSection from './components/BatchAnalysisSection';
import AnalysisResult from './components/AnalysisResult';
import SearchSection from './components/SearchSection';
import RankingSection from './components/RankingSection';
import Stats from './components/Stats';
import { ProjectIntro } from './components/ProjectIntro';
import { SongDetail } from './components/SongDetail';
import InstructionsSection from './components/InstructionsSection';

// Import custom hooks
import { useAppState } from './components/AppState';
import { useFileHandlers } from './components/FileHandlers';
import { useRankingUtils } from './components/RankingUtils';
import { useRankTabLogic } from './components/RankTabLogic';

function App() {
  // Wrap the entire app with BottomPlayerProvider
  return (
    <BottomPlayerProvider>
      <AppContent />
    </BottomPlayerProvider>
  );
}

function AppContent() {
  // 添加顶层Tab状态
  const [activeMainTab, setActiveMainTab] = useState('single');

  // Initialize app state
  const {
    file, setFile,
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
    audioUrl, 
    setAudioUrl, 
    fileInputRef, 
    setLoading, 
    setUploadProgress, 
    authorName, 
    privacyMode, 
    setRating, 
    setStats
  );

  // Initialize ranking utilities
  const { fetchRankList, fetchSongDetail } = useRankingUtils();

  // Use rank tab logic
  useRankTabLogic(activeRankTab, setRankLoading, setRankList, fetchRankList);

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
        </div>
      </div>
      
      {/* 单曲分析Tab内容 */}
      {activeMainTab === 'single' && (
        <>
          <UploadSection 
            file={file}
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
          />

          {rating && <AnalysisResult rating={rating} />}
          
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
        <BatchAnalysisSection
          authorName={authorName}
          privacyMode={privacyMode}
          loading={loading}
          uploadProgress={uploadProgress}
          setAuthorName={setAuthorName}
          setPrivacyMode={setPrivacyMode}
        />
      )}

      {selectedSong && <SongDetail selectedSong={selectedSong} onClose={() => setSelectedSong(null)} />}

      <Stats stats={stats} />
      <BottomPlayer />
    </div>
  );
}

export default App;
