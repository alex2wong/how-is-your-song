import React, { useEffect, useRef, useState } from "react";
import { RiMusic2Fill, RiPlayFill } from "react-icons/ri";
import "./index.css";
import mothersdayImg from "./mothersday.png"; // 请将母亲节插画图片放在本目录下
import { useBottomPlayer } from "../BottomPlayer/BottomPlayerContext";
import { apiBase } from "../../utils";
import domtoimage from "dom-to-image-more";
import { useToast } from "../ToastMessage/ToastContext";
import { QRCodeCanvas } from 'qrcode.react';


const lovelyWords = `
亲爱的妈妈，感谢您的付出与爱，祝您永远快乐!
在无涯无际的时间海里
漂浮着一个无知无觉的我
是她划着一只爱的小船
把我打捞到了人世间
在无怨无悔的麦地田里
为我种下无忧无虑的春天
让我跟着花草一起疯长
把风雨扛在自己双肩
岁月的手啊
无影无形
却将蒲公英的孩子
带到海角天边
在无穷无尽的庸碌日常
我一次又一次怀念
在无亲无故的异地他乡
我一次又一次梦见
一场无声无息的大雪
已经落满了她的发间
岁月的手啊
无影无形
却将蒲公英的孩子
带到海角天边
在无穷无尽的庸碌日常
我一次又一次怀念
带到海角天边
在无穷无尽的庸碌日常
我一次又一次怀念`;

const defaultMessage = `❤️ 亲爱的妈妈，谢谢对我的付出与无私的爱，祝您永远快乐! ❤️你`;

/**
 * SharePoster 母亲节歌曲海报组件
 * @param {string} songName 歌曲名
 * @param {string} message 写给妈妈的一句话
 * @param {string} [comment] 歌曲整体评价（默认展示）
 * @param {string} [qrUrl] 二维码链接（默认当前页面）
 */
const SharePoster = ({ song, message, comment, qrUrl }) => {
  const { play, pause, isPlaying, audioUrl } = useBottomPlayer();
  const songAudioUrl = `${apiBase}/audio/${song.url.replace("uploads/", "")}`;
  const songName = song.song_name ?? "献给妈妈的歌";
  const contentRef = useRef(null);
  const songAuthor = song.author ?? '妈妈的儿女'
  
  const [posterMessage,setMessage] = useState(defaultMessage)

  const { showToast } = useToast();

  const qrValue = qrUrl || (typeof window !== 'undefined' ? window.location.href : '');

  // 播放/暂停按钮点击事件
  const handlePlayPause = () => {
    if (isPlaying && audioUrl === songAudioUrl) {
      pause();
    } else {
      play(songAudioUrl, song);
    }
  };

  const getRandomTwoSentenceForPosterMessage = () => {
    const words = lovelyWords.split('\n');
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
  }

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
      link.download = `母亲节歌曲-${songName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("歌曲海报已下载");
    } catch (error) {
      console.error("图片生成失败:", error);
      showToast("海报下载失败");
    }
  };

  const imageSet = {
    src: 'https://aiyueping.com/favicon.ico',
                height: 16,
                width: 16,
                excavate: true,
                opacity: 1,
                crossOrigin: 'anonymous'
  }

  useEffect(()=>{
    
  }, [])

  return (
    <div className="share-poster-root">
      <div ref={contentRef} className="share-poster-card">
        {/* 封面插画+歌曲名+作者名融合 */}
        <div className="poster-image-wrapper">
          <img src={mothersdayImg} alt="母亲节插画" className="poster-image" />
          <div className="poster-image-overlay">
            <div className="poster-song-title">{songName}</div>
            {songAuthor && <div className="poster-song-author">{songAuthor}</div>}
          </div>
          {/* 半透明播放按钮 */}
          <div className="play-button" onClick={handlePlayPause}>
            <RiPlayFill size={40} color="#fff" />
          </div>
        </div>
        {/* 胶带效果 */}
        <div className="poster-tape tape-top-left" />
        <div className="poster-tape tape-top-right" />
        {/* 写给妈妈的一句话/整体评价 */}
        <div className="poster-message" suppressContentEditableWarning contentEditable>
          {posterMessage ?? defaultMessage}
        </div>
        {/* #Music mood 标签 */}
        <div className="poster-tag-row">
          <div className="poster-tag">#写给妈妈的歌 </div>
          <div className="poster-tag">#母亲节特辑 </div>
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
                      <div className="poster-qrcode-text" >点击保存海报</div>

        </div>
      </div>
    </div>
  );
};

export default SharePoster;
