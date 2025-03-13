import React, { useRef } from 'react';
import './App.css';

// Import modular components
import Header from './components/Header';
import UploadSection from './components/UploadSection';
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

      {selectedSong && <SongDetail selectedSong={selectedSong} onClose={() => setSelectedSong(null)} />}

      <Stats stats={stats} />
    </div>
  );
}

export default App;
