import React, { useState, useRef } from 'react';
import { RiVideoUploadLine, RiMusic2Line, RiFileUploadLine, RiImageAddLine, RiArrowDownSLine } from 'react-icons/ri';

const MVGenerationSection = () => {
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [songTitle, setSongTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [videoOrientation, setVideoOrientation] = useState('landscape'); // 'landscape' 或 'portrait'
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [lyrics, setLyrics] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedMV, setGeneratedMV] = useState(null);
  
  const musicInputRef = useRef(null);
  const imageInputRef = useRef(null);
  
  // 处理音乐文件选择
  const handleMusicFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedMusic(e.target.files[0]);
    }
  };
  
  // 清除选择的音乐文件
  const handleClearMusic = () => {
    setSelectedMusic(null);
    if (musicInputRef.current) {
      musicInputRef.current.value = '';
    }
  };
  
  // 处理背景图片选择
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBackgroundImage({
        file: e.target.files[0],
        preview: URL.createObjectURL(e.target.files[0])
      });
    }
  };
  
  // 清除选择的背景图片
  const handleClearImage = () => {
    if (backgroundImage && backgroundImage.preview) {
      URL.revokeObjectURL(backgroundImage.preview);
    }
    setBackgroundImage(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };
  
  // 生成MV的函数（目前只是一个占位函数）
  const handleGenerateMV = () => {
    // 验证必填字段
    if (!selectedMusic) {
      alert('请选择音乐文件');
      return;
    }
    
    if (!songTitle.trim()) {
      alert('请输入歌曲标题');
      return;
    }
    
    if (!authorName.trim()) {
      alert('请输入作者名称');
      return;
    }
    
    if (!backgroundImage) {
      alert('请选择背景图片');
      return;
    }
    
    if (!lyrics.trim()) {
      alert('请输入歌词时间轴');
      return;
    }
    
    setGenerating(true);
    
    // 模拟生成过程
    setTimeout(() => {
      setGenerating(false);
      setGeneratedMV({
        url: URL.createObjectURL(new Blob([], { type: 'video/mp4' })),
        name: `${songTitle}_${authorName}_MV.mp4`
      });
    }, 3000);
  };
  
  // 示例歌词
  const exampleLyrics = `00:00.00
(Intro - Saxophone)
00:15.06
我很想要一个答案
00:17.68
来填补我生命的空缺
00:22.04
一场雷阵雨如何能浇灭
00:26.62
这些不安的火焰
00:29.94
不是每一个春天都是春天
00:33.61
不是每一段恋情都会圆满`;

  // 填充示例歌词
  const fillExampleLyrics = () => {
    setLyrics(exampleLyrics);
  };
  
  return (
    <section className="mv-generation-section">
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
        <div style={{ padding: '20px' }}>
          <h2 style={{ marginBottom: '10px', color: '#2D3748' }}>一键MV生成</h2>
          <p style={{ color: '#4A5568', marginBottom: '20px' }}>
            生成过程完全在本地浏览器，不上传任何数据，保护您的隐私和数据安全。
          </p>
          
          {/* 步骤1：选择音乐文件 */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', color: '#4A5568' }}>1. 选择音乐文件</h3>
            {!selectedMusic ? (
              <div 
                style={{
                  border: '2px dashed #e2e8f0',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#f8fafc'
                }}
                onClick={() => musicInputRef.current.click()}
              >
                <RiMusic2Line style={{ fontSize: '2rem', color: '#6B66FF', marginBottom: '10px' }} />
                <p style={{ color: '#718096' }}>点击选择音乐文件（支持 MP3、WAV 格式）</p>
                <input
                  ref={musicInputRef}
                  type="file"
                  accept=".mp3,.wav,audio/*"
                  onChange={handleMusicFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '12px', 
                backgroundColor: 'rgba(107, 102, 255, 0.05)', 
                borderRadius: '8px'
              }}>
                <RiMusic2Line style={{ fontSize: '1.5rem', color: '#6B66FF', marginRight: '12px' }} />
                <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <div style={{ fontWeight: 'bold' }}>{selectedMusic.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {(selectedMusic.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
                <button 
                  onClick={handleClearMusic}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#718096',
                    fontSize: '1.2rem'
                  }}
                >
                  <RiFileUploadLine />
                </button>
              </div>
            )}
          </div>
          
          {/* 步骤2：输入歌曲信息 */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', color: '#4A5568' }}>2. 输入歌曲信息</h3>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#4A5568' }}>歌曲标题</label>
                <input 
                  type="text" 
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder="请输入歌曲标题"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#4A5568' }}>作者名称</label>
                <input 
                  type="text" 
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="请输入作者名称"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* 步骤3：选择视频方向 */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', color: '#4A5568' }}>3. 选择视频方向</h3>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div 
                onClick={() => setVideoOrientation('landscape')}
                style={{
                  flex: 1,
                  padding: '15px',
                  border: `2px solid ${videoOrientation === 'landscape' ? '#6B66FF' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: videoOrientation === 'landscape' ? 'rgba(107, 102, 255, 0.05)' : 'white'
                }}
              >
                <div style={{ 
                  width: '100%', 
                  height: '60px', 
                  backgroundColor: '#e2e8f0',
                  borderRadius: '4px',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#718096',
                  fontSize: '0.8rem'
                }}>16:9</div>
                <div style={{ fontWeight: videoOrientation === 'landscape' ? 'bold' : 'normal' }}>横版视频</div>
              </div>
              <div 
                onClick={() => setVideoOrientation('portrait')}
                style={{
                  flex: 1,
                  padding: '15px',
                  border: `2px solid ${videoOrientation === 'portrait' ? '#6B66FF' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: videoOrientation === 'portrait' ? 'rgba(107, 102, 255, 0.05)' : 'white'
                }}
              >
                <div style={{ 
                  width: '60px', 
                  height: '100px', 
                  backgroundColor: '#e2e8f0',
                  borderRadius: '4px',
                  marginBottom: '10px',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#718096',
                  fontSize: '0.8rem'
                }}>9:16</div>
                <div style={{ fontWeight: videoOrientation === 'portrait' ? 'bold' : 'normal' }}>竖版视频</div>
              </div>
            </div>
          </div>
          
          {/* 步骤4：选择背景图片 */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', color: '#4A5568' }}>4. 选择背景图片</h3>
            {!backgroundImage ? (
              <div 
                style={{
                  border: '2px dashed #e2e8f0',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#f8fafc'
                }}
                onClick={() => imageInputRef.current.click()}
              >
                <RiImageAddLine style={{ fontSize: '2rem', color: '#6B66FF', marginBottom: '10px' }} />
                <p style={{ color: '#718096' }}>点击选择背景图片（将根据视频方向自动裁剪）</p>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <img 
                  src={backgroundImage.preview} 
                  alt="背景图片预览" 
                  style={{ 
                    width: '100%', 
                    height: '200px', 
                    objectFit: 'cover', 
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }} 
                />
                <button 
                  onClick={handleClearImage}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#4A5568'
                  }}
                >
                  <RiFileUploadLine />
                </button>
              </div>
            )}
          </div>
          
          {/* 步骤5：输入歌词时间轴 */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#4A5568' }}>5. 输入带时间戳的歌词</h3>
              <button 
                onClick={fillExampleLyrics}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#6B66FF',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}
              >
                填充示例
              </button>
            </div>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="请按照以下格式输入歌词时间轴：
00:00.00
(Intro - Saxophone)
00:15.06
我很想要一个答案
..."
              style={{
                width: '100%',
                height: '200px',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '1rem',
                fontFamily: 'monospace',
                resize: 'vertical'
              }}
            ></textarea>
            <p style={{ fontSize: '0.9rem', color: '#718096', marginTop: '5px' }}>
              格式说明：每行时间戳（分:秒.毫秒）后面跟着对应的歌词内容。可直接将排行榜中歌曲评分后的歌词时间轴复制过来使用。
            </p>
          </div>
          
          {/* 步骤6：开始生成 */}
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={handleGenerateMV}
              disabled={generating}
              style={{
                backgroundColor: generating ? '#a0aec0' : '#6B66FF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '15px 24px',
                fontWeight: 'bold',
                cursor: generating ? 'not-allowed' : 'pointer',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1.1rem'
              }}
            >
              <RiVideoUploadLine />
              {generating ? '生成中...' : '开始生成MV'}
            </button>
          </div>
          
          {/* 步骤7和8：视频预览和下载 */}
          {generatedMV && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '15px', fontSize: '1.1rem', color: '#4A5568' }}>生成结果</h3>
              <video 
                controls 
                style={{ 
                  width: '100%', 
                  borderRadius: '8px', 
                  backgroundColor: '#000',
                  aspectRatio: videoOrientation === 'landscape' ? '16/9' : '9/16',
                  maxHeight: '500px',
                  margin: '0 auto',
                  display: 'block'
                }}
                src={generatedMV.url}
              >
                您的浏览器不支持视频播放
              </video>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center', 
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{generatedMV.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                    {videoOrientation === 'landscape' ? '横版 16:9' : '竖版 9:16'} • {songTitle} • {authorName}
                  </div>
                </div>
                <a 
                  href={generatedMV.url} 
                  download={generatedMV.name}
                  style={{
                    backgroundColor: '#6B66FF',
                    color: 'white',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <RiArrowDownSLine /> 下载MV
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MVGenerationSection;
