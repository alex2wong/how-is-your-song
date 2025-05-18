import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { QRCodeCanvas } from 'qrcode.react';

import RankingSection from '../../components/RankingSection';
import useAppState from '../../components/AppState';
import useRankingUtils from '../../components/RankingUtils';
import useRankTabLogic from '../../components/RankTabLogic';
import './index.css';
import { RiMusic2Fill } from 'react-icons/ri';
import { SongDetail } from '../../components/SongDetail';

const RankPage = () => {
  const [searchParams] = useSearchParams();
const {
    selectedSong, setSelectedSong,
    rankList, setRankList,
    rankLoading, setRankLoading,
    } = useAppState();
  const { fetchRankList, fetchSongDetail } = useRankingUtils()
  const rankId = searchParams.get('tab');
  const [activeRankTab, setActiveRankTab] = useState(rankId);

  const qrValue = (typeof window !== 'undefined' ? window.location.href : '');

  useEffect(() => {
    if (activeRankTab) {
      console.log('fetch query rankId', rankId);
    }
  }, [activeRankTab]);
  // Use rank tab logic
  useRankTabLogic(activeRankTab, setRankLoading, setRankList, fetchRankList);

  return (
    <section className="ranking-section">
      <div className="rank-header">
        <div className="logo">
          <RiMusic2Fill className="logo-icon" />
          <div>
            <div className="logo-text">爱乐评</div>
            <div className="logo-domain">aiyueping.com</div>
          </div>
          
        </div>
        {/* 右侧二维码 */}
        <div
            className="poster-qrcode-placeholder"
            style={{ padding: 0, background: "none" }}
          >
            <QRCodeCanvas
              title="AiYuePing"
              value={qrValue}
              level="M"
              size={60}
              bgColor="#fff"
              fgColor="rgb(191, 167, 106)"
            />
            <div className="poster-qrcode-text">扫码听榜单</div>
          </div>
      </div>
      <RankingSection
        activeRankTab={activeRankTab}
        setActiveRankTab={setActiveRankTab}
        rankList={rankList}
        rankLoading={rankLoading}
        isSyncTabToQuery={true}
        fetchSongDetail={(id) => fetchSongDetail(id, setSelectedSong)}
      />
      {selectedSong && <SongDetail selectedSong={selectedSong} onClose={() => setSelectedSong(null)} />}
    </section>
  );
};

export default RankPage;