import {
  FaShare,
  FaThumbsUp,
  FaRegThumbsUp,
  FaSpinner,
  FaCopy,
  FaVideo,
  FaDownload,
  FaFilePdf,
  FaFileImage,
  FaImage,
  FaEdit,
  FaSave,
} from "react-icons/fa";
import { RiPlayFill, RiPauseFill } from "react-icons/ri";
import { apiBase, scoreClassStyles, getAuthorNameColor } from "../utils";
import { useBottomPlayer } from "./BottomPlayer/BottomPlayerContext";
import { copyShareLinkforSong } from "../utils";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useToast } from "./ToastMessage/ToastContext";
import RadarChart from "./chart";
import domtoimage from "dom-to-image-more";
import { jsPDF } from "jspdf";
import { parseSongStructureLyrics } from "../utils/lyrics";

/**
 * 
 * .exellent {
    color: #4CAF50;
  }
  .good {
    color: #f7cb73;
  }
  .normal {
    color: #ff3c00;
  }
  
 */

export const SongDetail = ({ selectedSong, _scoreRender, onClose }) => {
  const { bgColor, classTxt } = scoreClassStyles(selectedSong.overall_score);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [songData, setSongData] = useState(selectedSong);
  const { play, pause, isPlaying, audioUrl } = useBottomPlayer();
  const songAudioUrl = selectedSong.url ? `${apiBase}/audio/${selectedSong.url.replace(
    "uploads/",
    ""
  )}` : '';
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showLyricEditModal, setShowLyricEditModal] = useState(false);
  const [editingLyrics, setEditingLyrics] = useState([]);
  const [isSavingLyrics, setIsSavingLyrics] = useState(false);
  const contentRef = useRef(null);

  const { showToast } = useToast();

  // Check if the song is already liked on component mount
  useEffect(() => {
    const likedSongs = JSON.parse(localStorage.getItem("likedSongs") || "[]");
    setIsLiked(likedSongs.includes(selectedSong._id));
    setSongData(selectedSong);
    
    // 初始化编辑歌词数据
    if (selectedSong.structure && selectedSong.structure.comments) {
      const parsedLyrics = parseSongStructureLyrics(selectedSong.structure.comments);
      setEditingLyrics(parsedLyrics);
    }
  }, [selectedSong._id, selectedSong.likes, selectedSong.structure]);

  // 点击其他区域时关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDownloadOptions && !event.target.closest(".download-button")) {
        setShowDownloadOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDownloadOptions]);
  
  // 处理歌词修正
  const handleOpenLyricEditModal = () => {
    if (songData.structure) {
      // 如果有已修正的歌词且hasCorrections为true，则使用修正后的歌词作为基础
      const sourceText = (songData.structure.hasCorrections && songData.structure.correctedLyrics) 
        ? songData.structure.correctedLyrics 
        : songData.structure.comments;
      
      if (sourceText) {
        // 有歌词内容，解析现有歌词
        const parsedLyrics = parseSongStructureLyrics(sourceText);
        setEditingLyrics(parsedLyrics);
      } else {
        // 歌词为空，创建一个空的歌词数组，允许用户完整输入
        setEditingLyrics([{ time: 0, text: '' }]);
      }
      setShowLyricEditModal(true);
    } else if (songData.structure === undefined || songData.structure === null) {
      // 如果structure不存在，创建一个空的结构
      setSongData(prev => ({
        ...prev,
        structure: { comments: '', hasCorrections: false }
      }));
      // 创建一个空的歌词数组，允许用户完整输入
      setEditingLyrics([{ time: 0, text: '' }]);
      setShowLyricEditModal(true);
    }
    console.log('打开歌词修正模态窗口', songData.structure);
  };
  
  // 处理歌词文本修改
  const handleLyricTextChange = (index, newText) => {
    const updatedLyrics = [...editingLyrics];
    updatedLyrics[index] = {
      ...updatedLyrics[index],
      text: newText
    };
    setEditingLyrics(updatedLyrics);
  };
  
  // 处理歌词时间戳修改
  const handleLyricTimeChange = (index, timeStr) => {
    // 先更新输入框的值，保证用户可以输入
    const updatedLyrics = [...editingLyrics];
    updatedLyrics[index] = {
      ...updatedLyrics[index],
      _timeStr: timeStr // 存储原始输入的字符串
    };
    
    try {
      // 验证时间格式是否正确 (MM:SS.SS)
      const timeMatch = timeStr.match(/^(\d{1,2}):(\d{1,2})(?:\.(\d{1,2}))?$/);
      if (timeMatch) {
        const minutes = parseInt(timeMatch[1]);
        const seconds = parseInt(timeMatch[2]);
        const centiseconds = timeMatch[3] ? parseInt(timeMatch[3]) : 0;
        
        // 计算总秒数
        const totalSeconds = minutes * 60 + seconds + centiseconds / 100;
        
        updatedLyrics[index] = {
          ...updatedLyrics[index],
          time: totalSeconds
        };
      }
      setEditingLyrics(updatedLyrics);
    } catch (error) {
      console.error('时间戳格式错误', error);
      // 即使出错也要更新状态，保证用户可以继续输入
      setEditingLyrics(updatedLyrics);
    }
  };
  
  // 保存修正后的歌词
  const handleSaveLyrics = async () => {
    try {
      setIsSavingLyrics(true);
      
      // 将修正后的歌词按时间排序
      const sortedLyrics = [...editingLyrics].sort((a, b) => a.time - b.time);
      
      // 将修正后的歌词转换为原始格式
      const formattedLyrics = sortedLyrics.map(lyric => {
        const minutes = Math.floor(lyric.time / 60);
        const seconds = lyric.time % 60;
        const timeStr = `[${minutes.toString().padStart(2, '0')}:${seconds.toFixed(2).padStart(5, '0')}]`;
        return `${timeStr}${lyric.text}`;
      }).join('\n');
      
      // 构建要更新的数据
      const updatedSongData = {
        ...songData,
        structure: {
          ...songData.structure,
          correctedLyrics: formattedLyrics,
          hasCorrections: true // 标记歌词已被修正
        }
      };
      
      // 调用API更新歌词
      await axios.post(`${apiBase}/update-lyrics/${selectedSong._id}`, {
        lyrics: formattedLyrics
      });
      
      // 更新本地状态
      setSongData(updatedSongData);
      setShowLyricEditModal(false);
      showToast("歌词已成功保存");
    } catch (error) {
      console.error("保存歌词时出错:", error);
      showToast("保存歌词失败，请重试");
    } finally {
      setIsSavingLyrics(false);
    }
  };

  // Toggle like status and update localStorage
  const handleLike = async () => {
    const likedSongs = JSON.parse(localStorage.getItem("likedSongs") || "[]");

    try {
      setIsLoading(true);

      if (isLiked) {
        // Remove from liked songs
        const updatedLikedSongs = likedSongs.filter(
          (id) => id !== selectedSong._id
        );
        localStorage.setItem("likedSongs", JSON.stringify(updatedLikedSongs));

        // Call the API to remove like using axios
        await axios.post(`${apiBase}/like/remove/${selectedSong._id}`);
        setSongData((prev) => ({
          ...prev,
          likes: Math.max(0, (prev.likes || 0) - 1),
        }));
      } else {
        // Add to liked songs
        likedSongs.push(selectedSong._id);
        localStorage.setItem("likedSongs", JSON.stringify(likedSongs));

        // Call the API to add like using axios
        await axios.post(`${apiBase}/like/add/${selectedSong._id}`);
        setSongData((prev) => ({
          ...prev,
          likes: (prev.likes || 0) + 1,
        }));
      }

      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error updating like status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scoreRender = (rating) => {
    if (!rating) {
      return "";
    }
    const songName = rating.song_name ? rating.song_name.replace(/\.[^/.]+$/, "") : '';

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <h3
            style={{
              margin: 0,
              background:
                "var(--accent-gradient, linear-gradient(135deg, #FC466B, #3F5EFB))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              textShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
            }}
          >
            {songName}
          </h3>
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
            {rating.overall_score}分
          </span>
          <span
            style={{
              color: bgColor,
              fontWeight: "bold",
            }}
          >
            {classTxt}
          </span>
        </div>
        {rating.authorName && (
          <p>
            <span
              style={{
                background: getAuthorNameColor(rating.authorName).bgColor,
                color: getAuthorNameColor(rating.authorName).textColor,
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "0.85em",
                marginLeft: "8px",
                display: "inline-block",
                verticalAlign: "middle",
                border: `1px solid ${
                  getAuthorNameColor(rating.authorName).borderColor
                }`,
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
              }}
            >
              {rating.authorName}
            </span>
          </p>
        )}
      </div>
    );
  };
  
  const handleScroll = (e) => {
    // stop event propagation
    e.stopPropagation();
  };

  const handleClose = () => {
    onClose && onClose();
  };

  const handlePlayPause = () => {
    if (isPlaying && audioUrl === songAudioUrl) {
      pause();
    } else {
      play(songAudioUrl, songData);
    }
  };

  const handleDownload = async (format) => {
    try {
      setIsDownloading(true);
      setShowDownloadOptions(false);

      const songName = selectedSong.song_name.replace(/\.[^/.]+$/, "");
      const element = contentRef.current;

      if (!element) {
        showToast("无法获取内容元素");
        setIsDownloading(false);
        return;
      }

      console.log("开始下载", format, element);

      // 暂时隐藏滚动条，以便截图完整
      const originalStyle = window.getComputedStyle(
        element.parentElement
      ).overflow;
      const originalMaxHeight = element.parentElement.style.maxHeight;
      element.parentElement.style.overflow = "visible";
      element.parentElement.style.maxHeight = "none";

      // 添加一个小延时，确保样式已应用
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 使用dom-to-image库而不是html2canvas
      const dataUrl = await domtoimage.toPng(element, {
        quality: 1,
        bgcolor: "#ffffff",
        width: element.offsetWidth,
        height: element.scrollHeight,
        style: {
          transform: "none",
          "transform-origin": "none",
        },
      });

      // 恢复原始样式
      element.parentElement.style.overflow = originalStyle;
      element.parentElement.style.maxHeight = originalMaxHeight;

      console.log("图片生成成功", dataUrl.substring(0, 100) + "...");

      if (format === "png") {
        // 下载为PNG
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${songName}-分析报告.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("PNG文件已下载");
      } else if (format === "pdf") {
        // 下载为PDF
        const img = new Image();
        img.onload = () => {
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
          });

          // 计算宽高比
          const imgWidth = 210; // A4宽度(mm)
          const imgHeight = (img.height * imgWidth) / img.width;

          // 处理分页
          const a4Height = 297; // A4高度(mm)

          if (imgHeight <= a4Height) {
            // 内容适合单页
            pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth, imgHeight);
          } else {
            // 内容需要分页
            let heightLeft = imgHeight;
            let position = 0;
            let page = 0;

            // 首页
            pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= a4Height;

            // 添加后续页
            while (heightLeft > 0) {
              position = -a4Height * (page + 1);
              page++;
              pdf.addPage();
              pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
              heightLeft -= a4Height;
            }
          }

          pdf.save(`${songName}-分析报告.pdf`);
          showToast("PDF文件已下载");
        };
        img.src = dataUrl;
      }
    } catch (error) {
      console.error("下载失败:", error);
      showToast("下载失败，请重试");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "var(--card-bg, rgba(255, 255, 255, 0.92))",
        padding: "0 24px 24px 24px",
        borderRadius: "var(--radius-lg, 16px)",
        boxShadow: "var(--shadow-lg, 0 8px 16px rgba(0, 0, 0, 0.1))",
        maxWidth: "90%",
        width: "800px",
        maxHeight: "90vh",
        overflow: "auto",
        zIndex: 1000,
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
      }}
      onScroll={handleScroll}
    >
      <div
        ref={contentRef}
        style={{
          backgroundColor: "var(--card-bg, rgba(255, 255, 255, 0.92))",
          width: "100%",
        }}
      >
        <div
          style={{
            position: "sticky",
            zIndex: 10,
            top: 0,
            padding: "24px 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            backgroundColor: "var(--card-bg, rgba(255, 255, 255, 0.92))",
            borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexDirection: "row",
              width: "40vw",
            }}
          >
            <button
              onClick={handlePlayPause}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                borderRadius: "50%",
                backgroundColor: "#6B66FF",
                color: "#fff",
                transition: "all 0.2s ease",
                minWidth: 36,
                minHeight: 36,
                padding: 0,
              }}
            >
              {isPlaying && audioUrl === songAudioUrl ? (
                <RiPauseFill style={{ width: 20, height: 20 }} color="#fff" />
              ) : (
                <RiPlayFill style={{ width: 20, height: 20 }} color="#fff" />
              )}
            </button>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              position: "relative",
            }}
          >
            <a
              className="tag-entry-content"
              target="_blank"
              href={`/poster/song/${selectedSong._id}`}
            >
              <span className="tag-entry-text">🎵音乐海报</span>
            </a>
            {isLoading ? (
              <FaSpinner
                style={{
                  width: "24px",
                  height: "24px",
                  flexShrink: 0,
                  color: "var(--text-secondary, #4A5568)",
                  marginRight: "4px",
                  animation: "spin 1s linear infinite",
                }}
              />
            ) : isLiked ? (
              <FaThumbsUp
                style={{
                  width: "24px",
                  height: "24px",
                  flexShrink: 0,
                  cursor: "pointer",
                  color: "var(--error, #f44336)",
                  marginRight: "4px",
                  filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))",
                }}
                onClick={handleLike}
              />
            ) : (
              <FaRegThumbsUp
                style={{
                  width: "24px",
                  height: "24px",
                  flexShrink: 0,
                  cursor: "pointer",
                  color: "var(--text-secondary, #4A5568)",
                  marginRight: "4px",
                  transition: "all 0.2s ease",
                }}
                onClick={handleLike}
              />
            )}
            <span
              style={{
                color: "var(--text-secondary, #4A5568)",
                fontSize: "14px",
              }}
            >
              {songData.likes || 0}
            </span>
            <FaShare
              style={{
                width: "24px",
                height: "24px",
                flexShrink: 0,
                cursor: "pointer",
                color: "var(--text-secondary, #4A5568)",
                marginLeft: "8px",
                transition: "all 0.2s ease",
                "&:hover": {
                  color: "var(--primary, #4CAF50)",
                },
              }}
              onClick={() => {
                copyShareLinkforSong(songData._id);
                showToast("链接已复制到剪贴板");
              }}
            />
            <div className="download-button" style={{ position: "relative" }}>
              {isDownloading ? (
                <FaSpinner
                  style={{
                    width: "24px",
                    height: "24px",
                    flexShrink: 0,
                    color: "var(--text-secondary, #4A5568)",
                    marginLeft: "8px",
                    animation: "spin 1s linear infinite",
                  }}
                />
              ) : (
                <FaDownload
                  className="download-button"
                  style={{
                    width: "24px",
                    height: "24px",
                    flexShrink: 0,
                    cursor: "pointer",
                    color: "var(--text-secondary, #4A5568)",
                    marginLeft: "8px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.color = "var(--primary, #4CAF50)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.color =
                      "var(--text-secondary, #4A5568)")
                  }
                  onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                />
              )}
              {showDownloadOptions && (
                <div
                  style={{
                    position: "absolute",
                    top: "30px",
                    right: "0",
                    backgroundColor: "white",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    borderRadius: "8px",
                    padding: "8px 0",
                    zIndex: 1001,
                    minWidth: "160px",
                  }}
                >
                  <div
                    className="download-option"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "8px 16px",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f5f5f5")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                    onClick={() => handleDownload("pdf")}
                  >
                    <FaFilePdf
                      style={{ marginRight: "8px", color: "#e74c3c" }}
                    />
                    <span>下载PDF</span>
                  </div>
                  <div
                    className="download-option"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "8px 16px",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f5f5f5")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                    onClick={() => handleDownload("png")}
                  >
                    <FaFileImage
                      style={{ marginRight: "8px", color: "#3498db" }}
                    />
                    <span>下载PNG</span>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleClose}
              style={{
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--bg-primary, #f8f9fa)",
                border: "none",
                borderRadius: "50%",
                cursor: "pointer",
                marginLeft: "8px",
                transition: "all 0.2s ease",
                boxShadow: "var(--shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.05))",
              }}
            >
              ×
            </button>
          </div>
        </div>
        <div
          style={{
            marginTop: 50,
            marginBottom: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {scoreRender(selectedSong)}
          <p
            className="summary-quote"
            style={{ fontSize: "16px", lineHeight: "1.6" }}
          >
            {selectedSong.comments}
          </p>
          <RadarChart data={selectedSong}></RadarChart>
        </div>
        <div
          className="tags-container"
          style={{
            position: "relative",
            paddingRight: "40px", // 为复制按钮预留空间
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginBottom: "24px",
            }}
          >
            {selectedSong.tags.map((tag, index) => (
              <span
                key={index}
                style={{
                  padding: "4px 12px",
                  borderRadius: "16px",
                  backgroundColor: "var(--bg-secondary, #f0f0f0)",
                  color: "var(--text-secondary, #4A5568)",
                  fontSize: "14px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <FaCopy
            className="copy-icon"
            onClick={() => {
              const tagsString = selectedSong.tags
                .map((t) => t.replace("#", ""))
                .join(", ");
              navigator.clipboard.writeText(tagsString);
              showToast("音乐标签已复制到剪贴板");
            }}
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              transition: "opacity 0.2s ease",
              color: "#555",
              fontSize: "16px",
            }}
          />
        </div>

        <div className="comments" style={{ marginBottom: "24px" }}>
          <h3
            style={{
              borderBottom: "2px solid var(--primary, #4CAF50)",
              paddingBottom: "8px",
              marginBottom: "16px",
            }}
          >
            详细解析
          </h3>
          <div style={{ display: "grid", gap: "20px" }}>
            {[
              { title: "编曲", data: selectedSong.arrangement },
              { title: "人声", data: selectedSong.vocal },
              { title: "结构", data: selectedSong.structure },
              { title: "歌词", data: selectedSong.lyrics },
            ].map((section) => (
              <div
                key={section.title}
                style={{
                  padding: "16px",
                  backgroundColor: "var(--card-bg, rgba(255, 255, 255, 0.92))",
                  borderRadius: "var(--radius-md, 12px)",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <h4 style={{ margin: 0 }}>{section.title}</h4>
                  <span
                    style={{
                      backgroundColor: scoreClassStyles(section.data?.score)
                        .bgColor,
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "14px",
                    }}
                  >
                    {section.data?.score}分
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: "600",
                    }}
                  >
                    歌词
                  </h3>
                  {songData.structure?.hasCorrections && (
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "12px",
                        color: "#f0ad4e",
                        backgroundColor: "rgba(240, 173, 78, 0.1)",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      已修正
                    </span>
                  )}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    lineHeight: "1.6",
                    textAlign: "left",
                  }}
                >
                  {section.data?.comments}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 歌词时间轴 */}
        {selectedSong.structure && selectedSong.structure.comments && (
          <div style={{ marginTop: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "2px solid var(--primary, #4CAF50)",
                paddingBottom: "8px",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ margin: 0 }}>歌词时间轴</h3>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => {
                    // 将歌词时间轴数据保存到localStorage
                    const fullText = selectedSong.structure.comments;

                    // 提取纯歌词时间轴内容，去除前面的评论信息
                    // 查找第一个时间戳格式的行，如[00:00.00]或00:00.00
                    const timeStampRegex = /\[?\d{2}:\d{2}\.\d{2}\]?/;
                    const lines = fullText.split("\n");

                    // 先提取所有的时间戳行
                    const timeStampLines = [];

                    for (let i = 0; i < lines.length; i++) {
                      const line = lines[i].trim();
                      if (!line) continue;

                      if (timeStampRegex.test(line)) {
                        // 提取时间戳和歌词
                        let timeStamp;
                        let lyricText = "";

                        // 直接提取原始行，不做任何格式转换
                        timeStamp = line;
                        lyricText = "";

                        // 检查下一行是否存在且不是时间戳行
                        if (
                          i + 1 < lines.length &&
                          !timeStampRegex.test(lines[i + 1])
                        ) {
                          lyricText = lines[i + 1].trim();
                        }

                        if (timeStamp) {
                          timeStampLines.push({
                            time: timeStamp,
                            text: lyricText,
                          });

                          // 如果下一行是歌词文本，跳过下一行
                          if (
                            i + 1 < lines.length &&
                            !timeStampRegex.test(lines[i + 1])
                          ) {
                            i++;
                          }
                        }
                      }
                    }

                    // 按照示例格式生成歌词字符串
                    let pureLyrics = "";

                    // 如果有歌词行，生成格式化的字符串
                    if (timeStampLines.length > 0) {
                      // 按照示例格式生成歌词字符串
                      const formattedLines = [];
                      timeStampLines.forEach((item) => {
                        formattedLines.push(item.time); // 时间戳行
                        formattedLines.push(item.text); // 歌词行
                      });

                      // 生成带双引号的字符串
                      // 使用单个换行符，避免重复
                      const rawLyrics = formattedLines.join("\n");
                      // 检查并替换可能的多余换行符
                      const cleanedLyrics = rawLyrics.replace(/\n+/g, "\n");
                      pureLyrics = JSON.stringify(cleanedLyrics);
                    }
                    console.log('selectedSong.structure.correctedLyrics', selectedSong.structure.correctedLyrics?.replace(/\n+/g, "\\n"));
                    console.log('pureLyrics', pureLyrics);
                    localStorage.setItem("mvGenerator_lyrics", selectedSong.structure.correctedLyrics? selectedSong.structure.correctedLyrics.replace(/\n+/g, "\\n") : pureLyrics);

                    // 关闭当前详情页
                    onClose();

                    // 通知父组件切换到MV生成页面
                    // 创建并触发自定义事件
                    const event = new CustomEvent("switchToMVTab");
                    window.dispatchEvent(event);

                    // 显示提示信息
                    showToast("歌词已导入到MV生成页面");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    backgroundColor: "#6B66FF",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "6px 12px",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    fontWeight: "bold",
                  }}
                  title="将歌词时间轴导入到MV生成页面"
                >
                  <FaVideo style={{ marginRight: "4px" }} /> 一键MV生成
                </button>
                <button
                  onClick={() => {
                    // 将歌词时间轴数据保存到localStorage
                    const fullText = selectedSong.structure.comments;

                    // 提取纯歌词时间轴内容，去除前面的评论信息
                    // 查找第一个时间戳格式的行，如[00:00.00]或00:00.00
                    const timeStampRegex = /\[?\d{2}:\d{2}\.\d{2}\]?/;
                    const lines = fullText.split("\n");

                    // 先提取所有的时间戳行
                    const timeStampLines = [];

                    for (let i = 0; i < lines.length; i++) {
                      const line = lines[i].trim();
                      if (!line) continue;

                      if (timeStampRegex.test(line)) {
                        // 提取时间戳和歌词
                        let timeStamp;
                        let lyricText = "";

                        // 直接提取原始行，不做任何格式转换
                        timeStamp = line;
                        lyricText = "";

                        // 检查下一行是否存在且不是时间戳行
                        if (
                          i + 1 < lines.length &&
                          !timeStampRegex.test(lines[i + 1])
                        ) {
                          lyricText = lines[i + 1].trim();
                        }

                        if (timeStamp) {
                          timeStampLines.push({
                            time: timeStamp,
                            text: lyricText,
                          });

                          // 如果下一行是歌词文本，跳过下一行
                          if (
                            i + 1 < lines.length &&
                            !timeStampRegex.test(lines[i + 1])
                          ) {
                            i++;
                          }
                        }
                      }
                    }

                    // 按照示例格式生成歌词字符串
                    let pureLyrics = "";

                    // 如果有歌词行，生成格式化的字符串
                    if (timeStampLines.length > 0) {
                      // 按照示例格式生成歌词字符串
                      const formattedLines = [];
                      timeStampLines.forEach((item) => {
                        formattedLines.push(item.time); // 时间戳行
                        formattedLines.push(item.text); // 歌词行
                      });
                      // copy to clipboard
                      navigator.clipboard.writeText(
                        formattedLines.filter((line) => line !== "").join("\n")
                      );
                    }

                    // 显示提示信息
                    showToast("歌词已复制");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    backgroundColor: "var(--primary, #4CAF50)",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "6px 12px",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    fontWeight: "bold",
                  }}
                  title="将歌词时间轴导入到MV生成页面"
                >
                  <FaCopy style={{ marginRight: "4px" }} /> 复制歌词
                </button>
                <button
                  onClick={handleOpenLyricEditModal}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    backgroundColor: "#f0ad4e",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "6px 12px",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    fontWeight: "bold",
                  }}
                  title="修正歌词错误"
                >
                  <FaEdit style={{ marginRight: "4px" }} /> 修正歌词
                </button>
              </div>
            </div>
            <div
              style={{
                padding: "16px",
                backgroundColor: "var(--card-bg, rgba(255, 255, 255, 0.92))",
                borderRadius: "var(--radius-md, 12px)",
                border: "1px solid rgba(0, 0, 0, 0.05)",
              }}
            >
              {parseSongStructureLyrics(
                // 如果有修正后的歌词，则显示修正后的歌词，否则显示原始歌词
                songData.structure.hasCorrections && songData.structure.correctedLyrics
                  ? songData.structure.correctedLyrics
                  : songData.structure.comments
              ).map(
                (lyric, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      marginBottom: "8px",
                      fontSize: "14px",
                      lineHeight: "1.6",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--primary, #4CAF50)",
                        marginRight: "16px",
                        fontFamily: "monospace",
                      }}
                    >
                      {Math.floor(lyric.time / 60)
                        .toString()
                        .padStart(2, "0")}
                      :{(lyric.time % 60).toFixed(2).padStart(5, "0")}
                    </span>
                    <span>{lyric.text}</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
      
      
    </div>
    {/* 歌词修正模态窗口 */}
    {showLyricEditModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              width: "80%",
              maxWidth: "800px",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "20px" }}>修正歌词</h2>
              <button
                onClick={() => setShowLyricEditModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                ×
              </button>
            </div>
            <div
              style={{
                marginBottom: "20px",
              }}
            >
              <p style={{ color: "#666", marginTop: 0 }}>
                在下方编辑框中修正歌词文本和时间戳。时间戳格式为 分钟:秒数.百分秒（例如 01:23.45）。完成后点击保存按钮。
                {editingLyrics.length === 0 && "歌词为空，请点击'添加歌词行'按钮添加歌词。"}
              </p>
              <div
                style={{
                  maxHeight: "50vh",
                  overflowY: "auto",
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  padding: "16px",
                }}
              >
                {editingLyrics.map((lyric, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      marginBottom: "12px",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="text"
                      value={lyric._timeStr !== undefined ? lyric._timeStr : `${Math.floor(lyric.time / 60)
                        .toString()
                        .padStart(2, "0")}:${(lyric.time % 60).toFixed(2).padStart(5, "0")}`}
                      onChange={(e) => handleLyricTimeChange(index, e.target.value)}
                      style={{
                        color: "var(--primary, #4CAF50)",
                        marginRight: "16px",
                        fontFamily: "monospace",
                        width: "120px",
                        padding: "8px 12px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                        fontSize: "14px",
                        textAlign: "center"
                      }}
                      title="时间戳格式: 分钟:秒数.百分秒"
                      placeholder="00:00.00"
                    />
                    <input
                      type="text"
                      value={lyric.text}
                      onChange={(e) => handleLyricTextChange(index, e.target.value)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                        fontSize: "14px",
                      }}
                    />
                    {editingLyrics.length > 1 && (
                      <button
                        onClick={() => {
                          const updatedLyrics = [...editingLyrics];
                          updatedLyrics.splice(index, 1);
                          setEditingLyrics(updatedLyrics);
                        }}
                        style={{
                          marginLeft: "8px",
                          background: "none",
                          border: "none",
                          color: "#f44336",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                        title="删除此行"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => {
                    // 添加新的歌词行，时间戳设置为最后一行的时间+5秒，如果没有行则设为0
                    // 按时间排序找到最大时间
                    const sortedLyrics = [...editingLyrics].sort((a, b) => b.time - a.time);
                    const lastTime = sortedLyrics.length > 0 
                      ? sortedLyrics[0].time + 5 
                      : 0;
                    setEditingLyrics([...editingLyrics, { time: lastTime, text: '' }]);
                  }}
                  style={{
                    marginTop: "12px",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    border: "1px dashed #4CAF50",
                    backgroundColor: "white",
                    color: "#4CAF50",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  + 添加歌词行
                </button>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <button
                onClick={() => setShowLyricEditModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  backgroundColor: "#f5f5f5",
                  cursor: "pointer",
                }}
              >
                取消
              </button>
              <button
                onClick={handleSaveLyrics}
                disabled={isSavingLyrics}
                style={{
                  padding: "8px 16px",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor: "var(--primary, #4CAF50)",
                  color: "white",
                  cursor: isSavingLyrics ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {isSavingLyrics ? (
                  <>
                    <FaSpinner
                      style={{
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    保存中...
                  </>
                ) : (
                  <>
                    <FaSave /> 保存修改
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
