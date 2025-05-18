import React, { useEffect, useRef, useState } from "react";
import { RiMusic2Fill, RiPlayFill } from "react-icons/ri";
import "./index.css";
import DefaultCover from "./default_cover.jpg";
import { useBottomPlayer } from "../BottomPlayer/BottomPlayerContext";
import { apiBase, copySharePosterLinkForSong, scoreClassStyles } from "../../utils";
import domtoimage from "dom-to-image-more";
import { useToast } from "../ToastMessage/ToastContext";
import { QRCodeCanvas } from 'qrcode.react';
import { parseSongStructureLyrics } from "../../utils/lyrics";
import { FaShare } from "react-icons/fa";

const defaultMessage = `❤️ 亲爱的妈妈，谢谢对我的付出与无私的爱，祝您永远快乐! ❤️你`;

/**
 * SharePoster 分享海报组件
 * @param {string} songName 歌曲名
 * @param {string} message 写给妈妈的一句话
 * @param {string} [comment] 歌曲整体评价（默认展示）
 * @param {string} [qrUrl] 二维码链接（默认当前页面）
 */
const SharePoster = ({ song, message, comment, qrUrl }) => {
  const { play, pause, isPlaying, audioUrl } = useBottomPlayer();
  const songAudioUrl = song.url ? `${apiBase}/audio/${song.url.replace("uploads/", "")}` : '';
  const songName = song.song_name ?? "";
  const contentRef = useRef(null);
  const songAuthor = song.authorName ?? '匿名'
  
  const [posterMessage, setMessage] = useState(song.comments)
  const [currentLyricIndex, setCurrentLyricIndex] = useState(2); // 当前高亮歌词索引
  const [lyrics, setLyrics] = useState([]); // 解析后的歌词数组
  const [activeTab, setActiveTab] = useState('message'); // 当前激活的标签页：message/lyrics
  const [totalScore, _]= useState(song.overall_score);
  const { bgColor, classTxt } = scoreClassStyles(song.overall_score);
  const [switchedTab, setSwitchedTab] = useState(false);

  const { showToast } = useToast();
  const qrValue = qrUrl || (typeof window !== 'undefined' ? window.location.href : '');

  // 播放/暂停按钮点击事件
  const handlePlayPause = () => {
    if (isPlaying && audioUrl === songAudioUrl) {
      pause();
    } else {
      play(songAudioUrl, song);
      if (!switchedTab) {
        setActiveTab('lyrics');
      }
      setSwitchedTab(true);
    }
  };

  const downloadSharePoster = async (format = "png") => {
    try {
      const element = contentRef.current;
      if (!element) {
        return;
      }

      // 使用dom-to-image库而不是html2canvas
      const dataUrl = await domtoimage.toPng(element, {
        quality: 1,
        bgcolor: "#ffffff",
        width: element.offsetWidth,
        height: element.scrollHeight,
        style: {
          transform: "none",
          "transform-origin": "none",
          'fontFamily': 'PingFang SC'
        },
      });

    //   // 恢复原始样式
    //   element.parentElement.style.overflow = originalStyle;
    //   element.parentElement.style.maxHeight = originalMaxHeight;

      console.log("图片生成成功", dataUrl.substring(0, 100) + "...");

      // 下载为PNG
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `爱乐评-${songName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("歌曲海报已下载");
    } catch (error) {
      console.error("图片生成失败:", error);
      showToast("海报下载失败");
    }
  };

  useEffect(() => {
    // 解析歌词
    const parsedLyrics = parseSongStructureLyrics(song.structure.comments);
    setLyrics(parsedLyrics);

    // 监听音频播放进度，更新当前歌词
    const handleTimeUpdate = () => {
      const audioElement = document.querySelector('audio');
      if (!audioElement) return;

      const currentTime = audioElement.currentTime;
      const index = parsedLyrics.findIndex((lyric, i) => {
        const nextLyric = parsedLyrics[i + 1];
        return currentTime >= lyric.time && (!nextLyric || currentTime < nextLyric.time);
      });

      if (index !== -1) {
        setCurrentLyricIndex(index);
      }
    };

    const audioElement = document.querySelector('audio');
    if (audioElement) {
      audioElement.addEventListener('timeupdate', handleTimeUpdate);
    }

    return () => {
      const audioElement = document.querySelector('audio');
      if (audioElement) {
        audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, [song.lyrics]);

  const isMobile = screen.width < 480;
  const cardClasses = `share-poster-card${isMobile? ' card-mobile' : ''}`;
  const imageWrapperClasses = `poster-image-wrapper${isMobile?' image-wrapper-mobile' : ''} ${isPlaying ? ' circle is-rotating' : ''}`;
  const titleMobileClasses = `poster-song-title${isMobile?' poster-title-mobile' : ''}`;
  const posterMessageClasses = `poster-message${isMobile?' poster-message-mobile' : ''}`;
  const posterLyricsClasses = `poster-lyrics${isMobile?' poster-lyrics-mobile' : ''}`;

  return (
    <div className="share-poster-root">
      <div ref={contentRef} className={cardClasses}>
        {/* 封面插画+歌曲名+作者名融合 */}
        <div onClick={handlePlayPause} className={imageWrapperClasses}>
          <img src={DefaultCover} alt="封面" className={`poster-image${isPlaying ? ' circle is-rotating' : ''}`} />
          <div className="poster-image-overlay" style={{
            background: `${isPlaying ? 'transparent': 'transparent'}`
          }}>
            <div className={titleMobileClasses}>{songName}</div>
            {songAuthor && <div className="poster-song-author">作者：{songAuthor}</div>}
          </div>
          {/* 半透明播放按钮 */}
          <div className="play-button" >
            <RiPlayFill size={40} color="#fff" />
          </div>
        </div>
        {/* 胶带效果 */}
        <div className="poster-tape tape-top-left">
        </div>
        <div className="poster-tape tape-top-right">
          <FaShare
              style={{
                width: "16px",
                height: "16px",
                // flexShrink: 0,
                cursor: "pointer",
                color: "var(--text-secondary, #6B66FF)",
                transition: "all 0.2s ease",
                "&:hover": {
                  color: "#6B66FF",
                },
              }}
              onClick={() => {
                copySharePosterLinkForSong(song._id);
                showToast("链接已复制到剪贴板");
              }}
            />
        </div>
        {/* 标签页切换器 */}
        <div className="poster-tabs">
          <div 
            className={`poster-tab ${activeTab === 'message' ? 'active' : ''}`}
            onClick={() => setActiveTab('message')}
          >
          </div>
          <div 
            className={`poster-tab ${activeTab === 'lyrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('lyrics')}
          >
            
          </div>
        </div>

        {/* 内容区域 */}
        <div className="poster-content" style={{ transform: `translateX(${activeTab === 'message' ? '25%' : '-25%'})` }}>
          <div className={posterMessageClasses} style={{ opacity: `${activeTab === 'message' ? 1: 0}` }} suppressContentEditableWarning>
            {posterMessage ?? defaultMessage}
            <div style={{ marginTop: 6 }}>
                <span
                style={{
                  background: bgColor,
                  color: "white",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                {totalScore}分
              </span>
              <span
                style={{
                  color: bgColor,
                  fontWeight: 700,
                  marginLeft: 4,
                }}
              >
                {classTxt}
              </span>
            </div>
          </div>
          <div className={posterLyricsClasses} style={{ opacity: `${activeTab !== 'message' ? 1: 0}` }}>
            {lyrics.slice(Math.max(0, currentLyricIndex - 2), currentLyricIndex + 3).map((lyric, index) => {
              const isCenter = index === Math.min(2, currentLyricIndex);
              return (
                <div
                  key={index}
                  className={`lyric-line ${isCenter ? 'active' : ''}`}
                  style={{
                    fontSize: isCenter ? '1.2em' : '1em',
                    opacity: isCenter ? 1 : 0.6,
                    transform: `scale(${isCenter ? 1.1 : 1})`,
                    fontWeight: isCenter ? 'bold' : 'normal',
                    color: isCenter ? '#6B66FF' : '#666',
                    margin: '8px 0',
                    transition: 'all 0.3s ease',
                    textAlign: 'center'
                  }}
                >
                  {lyric.text}
                </div>
              );
            })}
          </div>
        </div>

        {/* 左下角 logo */}
        <div className="poster-logo">
          <RiMusic2Fill className="poster-logo-icon" />
          <span className="poster-logo-text">爱乐评</span>
          <div className="poster-logo-text" onClick={() => {
            location.href = '/'
        }}>aiyueping.com</div>
        </div>
        {/* 右下角二维码 */}
        <div className="poster-qrcode-placeholder" style={{padding:0,background:'none'}} onClick={downloadSharePoster}>
            {/**保存歌曲海报 */}
          <QRCodeCanvas title="AiYuePing" value={qrValue} level="M" size={60} bgColor="#fff" fgColor="rgb(191, 167, 106)" includeMargin={false} 
          />
                      <div className="poster-qrcode-text" >扫码听听看</div>

        </div>
      </div>
    </div>
  );
};

export default SharePoster;
