import React from 'react';

/**
 * 歌词显示风格选择组件
 */
const LyricsStyleSelector = ({ 
  lyricsMaskStyle, 
  setLyricsMaskStyle, 
  lyricsStrokeStyle, 
  setLyricsStrokeStyle,
  lyricsFontSize,
  setLyricsFontSize,
  lyricsColor,
  setLyricsColor,
  lyricsSecondaryColor,
  setLyricsSecondaryColor,
  titleFontSize,
  setTitleFontSize,
  titleMargin,
  setTitleMargin,
  titlePosition,
  setTitlePosition,
  videoBitrate,
  setVideoBitrate,
  lyricsDisplayMode,
  setLyricsDisplayMode
}) => {
  // 处理字号输入变化
  const handleFontSizeChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setLyricsFontSize(value);
    }
  };
  
  // 处理标题字号输入变化
  const handleTitleFontSizeChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setTitleFontSize(value);
    }
  };
  
  // 处理标题边距输入变化
  const handleTitleMarginChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setTitleMargin(value);
    }
  };
  
  // 处理视频码率输入变化
  const handleVideoBitrateChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setVideoBitrate(value);
    }
  };

  // 处理主色变化
  const handleColorChange = (e) => {
    setLyricsColor(e.target.value);
  };
  
  // 处理配色变化
  const handleSecondaryColorChange = (e) => {
    setLyricsSecondaryColor(e.target.value);
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', color: '#4A5568' }}>7. 显示风格设置</h3>
      
      {/* 歌词显示模式选项 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px', fontSize: '1rem', color: '#4A5568' }}>歌词显示模式</h4>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div 
            onClick={() => setLyricsDisplayMode('multiLine')}
            style={{
              flex: '1',
              padding: '12px 8px',
              border: `2px solid ${lyricsDisplayMode === 'multiLine' ? '#6B66FF' : '#e2e8f0'}`,
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: lyricsDisplayMode === 'multiLine' ? 'rgba(107, 102, 255, 0.05)' : 'white'
            }}
          >
            <div style={{ 
              width: '40px', 
              height: '40px', 
              backgroundColor: '#e2e8f0',
              borderRadius: '4px',
              marginBottom: '8px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#718096',
              fontSize: '0.8rem'
            }}>多行</div>
            <div style={{ fontWeight: lyricsDisplayMode === 'multiLine' ? 'bold' : 'normal', fontSize: '0.9rem' }}>多行模式</div>
          </div>
          <div 
            onClick={() => setLyricsDisplayMode('singleLine')}
            style={{
              flex: '1',
              padding: '12px 8px',
              border: `2px solid ${lyricsDisplayMode === 'singleLine' ? '#6B66FF' : '#e2e8f0'}`,
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: lyricsDisplayMode === 'singleLine' ? 'rgba(107, 102, 255, 0.05)' : 'white'
            }}
          >
            <div style={{ 
              width: '40px', 
              height: '40px', 
              backgroundColor: '#e2e8f0',
              borderRadius: '4px',
              marginBottom: '8px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#718096',
              fontSize: '0.8rem'
            }}>单行</div>
            <div style={{ fontWeight: lyricsDisplayMode === 'singleLine' ? 'bold' : 'normal', fontSize: '0.9rem' }}>单行模式</div>
          </div>
        </div>
      </div>
      
      {/* 遮罩和描边选项 */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        {/* 遮罩选项组 */}
        <div style={{ flex: 1, display: 'flex', gap: '10px' }}>
          <div 
            onClick={() => setLyricsMaskStyle('mask')}
            style={{
              flex: '1',
              padding: '12px 8px',
              border: `2px solid ${lyricsMaskStyle === 'mask' ? '#6B66FF' : '#e2e8f0'}`,
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: lyricsMaskStyle === 'mask' ? 'rgba(107, 102, 255, 0.05)' : 'white'
            }}
          >
            <div style={{ 
              width: '40px', 
              height: '40px', 
              backgroundColor: '#e2e8f0',
              borderRadius: '4px',
              marginBottom: '8px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#718096',
              fontSize: '0.8rem'
            }}>遮罩</div>
            <div style={{ fontWeight: lyricsMaskStyle === 'mask' ? 'bold' : 'normal', fontSize: '0.9rem' }}>有遮罩</div>
          </div>
          <div 
            onClick={() => setLyricsMaskStyle('noMask')}
            style={{
              flex: '1',
              padding: '12px 8px',
              border: `2px solid ${lyricsMaskStyle === 'noMask' ? '#6B66FF' : '#e2e8f0'}`,
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: lyricsMaskStyle === 'noMask' ? 'rgba(107, 102, 255, 0.05)' : 'white'
            }}
          >
            <div style={{ 
              width: '40px', 
              height: '40px', 
              backgroundColor: '#e2e8f0',
              borderRadius: '4px',
              marginBottom: '8px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#718096',
              fontSize: '0.8rem'
            }}>无遮罩</div>
            <div style={{ fontWeight: lyricsMaskStyle === 'noMask' ? 'bold' : 'normal', fontSize: '0.9rem' }}>无遮罩</div>
          </div>
        </div>
        
        {/* 描边选项组 */}
        <div style={{ flex: 1, display: 'flex', gap: '10px' }}>
          <div 
            onClick={() => setLyricsStrokeStyle('stroke')}
            style={{
              flex: '1',
              padding: '12px 8px',
              border: `2px solid ${lyricsStrokeStyle === 'stroke' ? '#6B66FF' : '#e2e8f0'}`,
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: lyricsStrokeStyle === 'stroke' ? 'rgba(107, 102, 255, 0.05)' : 'white'
            }}
          >
            <div style={{ 
              width: '40px', 
              height: '40px', 
              backgroundColor: '#e2e8f0',
              borderRadius: '4px',
              marginBottom: '8px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#718096',
              fontSize: '0.8rem'
            }}>描边</div>
            <div style={{ fontWeight: lyricsStrokeStyle === 'stroke' ? 'bold' : 'normal', fontSize: '0.9rem' }}>有描边</div>
          </div>
          <div 
            onClick={() => setLyricsStrokeStyle('noStroke')}
            style={{
              flex: '1',
              padding: '12px 8px',
              border: `2px solid ${lyricsStrokeStyle === 'noStroke' ? '#6B66FF' : '#e2e8f0'}`,
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: lyricsStrokeStyle === 'noStroke' ? 'rgba(107, 102, 255, 0.05)' : 'white'
            }}
          >
            <div style={{ 
              width: '40px', 
              height: '40px', 
              backgroundColor: '#e2e8f0',
              borderRadius: '4px',
              marginBottom: '8px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#718096',
              fontSize: '0.8rem'
            }}>无描边</div>
            <div style={{ fontWeight: lyricsStrokeStyle === 'noStroke' ? 'bold' : 'normal', fontSize: '0.9rem' }}>无描边</div>
          </div>
        </div>
      </div>
      
      {/* 字号设置 */}
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ marginBottom: '10px', fontSize: '1rem', color: '#4A5568' }}>歌词字号</h4>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '10px',
          padding: '10px',
          backgroundColor: '#f7fafc',
          borderRadius: '8px'
        }}>
          <span style={{ fontSize: '0.9rem', color: '#718096', whiteSpace: 'nowrap' }}>字号:</span>
          <input 
            type="number" 
            value={lyricsFontSize}
            onChange={handleFontSizeChange}
            min="10"
            max="60"
            style={{
              width: '60px',
              padding: '8px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}
          />
          <span style={{ fontSize: '0.9rem', color: '#718096' }}>px</span>
          
          {/* 快速预设按钮 */}
          <div style={{ display: 'flex', gap: '5px' }}>
            <button 
              onClick={() => setLyricsFontSize(20)}
              style={{
                padding: '6px 10px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                backgroundColor: lyricsFontSize === 20 ? 'rgba(107, 102, 255, 0.1)' : 'white',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              小
            </button>
            <button 
              onClick={() => setLyricsFontSize(28)}
              style={{
                padding: '6px 10px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                backgroundColor: lyricsFontSize === 28 ? 'rgba(107, 102, 255, 0.1)' : 'white',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              中
            </button>
            <button 
              onClick={() => setLyricsFontSize(36)}
              style={{
                padding: '6px 10px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                backgroundColor: lyricsFontSize === 36 ? 'rgba(107, 102, 255, 0.1)' : 'white',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              大
            </button>
          </div>
        </div>
      </div>
      
      {/* 颜色设置 */}
      <div>
        <h4 style={{ marginBottom: '10px', fontSize: '1rem', color: '#4A5568' }}>歌词颜色</h4>
        
        {/* 主色（高亮歌词颜色） */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '10px',
          padding: '10px',
          backgroundColor: '#f7fafc',
          borderRadius: '8px',
          marginBottom: '10px'
        }}>
          <span style={{ fontSize: '0.9rem', color: '#718096', whiteSpace: 'nowrap' }}>主色:</span>
          <div style={{ 
            display: 'inline-block', 
            padding: '2px', 
            border: '1px solid #e2e8f0', 
            borderRadius: '4px',
            backgroundColor: '#fff'
          }}>
            <input 
              type="color" 
              value={lyricsColor}
              onChange={handleColorChange}
              style={{
                width: '36px',
                height: '36px',
                border: 'none',
                borderRadius: '2px',
                cursor: 'pointer',
                padding: '0'
              }}
            />
          </div>
          
          <input 
            type="text" 
            value={lyricsColor}
            onChange={handleColorChange}
            style={{
              width: '80px',
              padding: '8px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}
          />
          
          <span style={{ fontSize: '0.9rem', color: '#718096', marginLeft: '5px' }}>当前歌词</span>
          
          {/* 快速颜色选择 */}
          <div style={{ display: 'flex', gap: '5px' }}>
            <div 
              onClick={() => setLyricsColor('#ffcc00')}
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#ffcc00',
                borderRadius: '4px',
                cursor: 'pointer',
                border: lyricsColor === '#ffcc00' ? '2px solid #6B66FF' : '1px solid #e2e8f0'
              }}
              title="黄色"
            ></div>
            <div 
              onClick={() => setLyricsColor('#ff66cc')}
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#ff66cc',
                borderRadius: '4px',
                cursor: 'pointer',
                border: lyricsColor === '#ff66cc' ? '2px solid #6B66FF' : '1px solid #e2e8f0'
              }}
              title="粉色"
            ></div>
            <div 
              onClick={() => setLyricsColor('#00ccff')}
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#00ccff',
                borderRadius: '4px',
                cursor: 'pointer',
                border: lyricsColor === '#00ccff' ? '2px solid #6B66FF' : '1px solid #e2e8f0'
              }}
              title="青色"
            ></div>
          </div>
        </div>
        
        {/* 配色（非高亮歌词颜色） */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '10px',
          padding: '10px',
          backgroundColor: '#f7fafc',
          borderRadius: '8px'
        }}>
          <span style={{ fontSize: '0.9rem', color: '#718096', whiteSpace: 'nowrap' }}>配色:</span>
          <div style={{ 
            display: 'inline-block', 
            padding: '2px', 
            border: '1px solid #e2e8f0', 
            borderRadius: '4px',
            backgroundColor: '#fff'
          }}>
            <input 
              type="color" 
              value={lyricsSecondaryColor}
              onChange={handleSecondaryColorChange}
              style={{
                width: '36px',
                height: '36px',
                border: 'none',
                borderRadius: '2px',
                cursor: 'pointer',
                padding: '0'
              }}
            />
          </div>
          
          <input 
            type="text" 
            value={lyricsSecondaryColor}
            onChange={handleSecondaryColorChange}
            style={{
              width: '80px',
              padding: '8px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}
          />
          
          <span style={{ fontSize: '0.9rem', color: '#718096', marginLeft: '5px' }}>其他歌词</span>
          
          {/* 快速颜色选择 */}
          <div style={{ display: 'flex', gap: '5px' }}>
            <div 
              onClick={() => setLyricsSecondaryColor('#ffffff')}
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                cursor: 'pointer',
                border: lyricsSecondaryColor === '#ffffff' ? '2px solid #6B66FF' : '1px solid #e2e8f0'
              }}
              title="白色"
            ></div>
            <div 
              onClick={() => setLyricsSecondaryColor('#cccccc')}
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#cccccc',
                borderRadius: '4px',
                cursor: 'pointer',
                border: lyricsSecondaryColor === '#cccccc' ? '2px solid #6B66FF' : '1px solid #e2e8f0'
              }}
              title="灰色"
            ></div>
            <div 
              onClick={() => setLyricsSecondaryColor('#ffffcc')}
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#ffffcc',
                borderRadius: '4px',
                cursor: 'pointer',
                border: lyricsSecondaryColor === '#ffffcc' ? '2px solid #6B66FF' : '1px solid #e2e8f0'
              }}
              title="淡黄色"
            ></div>
          </div>
        </div>
      </div>
      
      {/* 标题设置 */}
      <div style={{ marginTop: '20px' }}>
        <h4 style={{ marginBottom: '10px', fontSize: '1rem', color: '#4A5568', textAlign: 'center' }}>标题设置</h4>
        <div style={{ 
          display: 'flex', 
          gap: '20px',
          marginBottom: '15px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {/* 标题字号 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '10px',
            backgroundColor: '#f7fafc',
            borderRadius: '8px',
            minWidth: '200px',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '0.9rem', color: '#718096', whiteSpace: 'nowrap' }}>标题字号:</span>
            <input 
              type="number" 
              min="12"
              max="48"
              value={titleFontSize}
              onChange={handleTitleFontSizeChange}
              style={{
                width: '60px',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            />
            <span style={{ fontSize: '0.9rem', color: '#718096' }}>px</span>
          </div>
          
          {/* 标题边距 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '10px',
            backgroundColor: '#f7fafc',
            borderRadius: '8px',
            minWidth: '200px',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '0.9rem', color: '#718096', whiteSpace: 'nowrap' }}>标题边距:</span>
            <input 
              type="number" 
              min="0"
              max="200"
              value={titleMargin}
              onChange={handleTitleMarginChange}
              style={{
                width: '60px',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            />
            <span style={{ fontSize: '0.9rem', color: '#718096' }}>px</span>
          </div>
        </div>
        
        {/* 标题位置 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px', fontSize: '1rem', color: '#4A5568' }}>标题位置</h4>
        <div style={{ 
          display: 'flex', 
          gap: '10px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {/* 左上 */}
          <div 
            onClick={() => setTitlePosition('leftTop')}
            style={{
              width: '80px',
              height: '60px',
              border: `2px solid ${titlePosition === 'leftTop' ? '#6B66FF' : '#e2e8f0'}`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              padding: '8px',
              cursor: 'pointer',
              backgroundColor: titlePosition === 'leftTop' ? 'rgba(107, 102, 255, 0.05)' : 'white',
              position: 'relative'
            }}
          >
            <div style={{ 
              fontSize: '0.7rem',
              fontWeight: titlePosition === 'leftTop' ? 'bold' : 'normal',
              color: '#4A5568'
            }}>左上</div>
            <div style={{
              position: 'absolute',
              bottom: '5px',
              right: '5px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: titlePosition === 'leftTop' ? '#6B66FF' : 'transparent'
            }}></div>
          </div>
          
          {/* 右上 */}
          <div 
            onClick={() => setTitlePosition('rightTop')}
            style={{
              width: '80px',
              height: '60px',
              border: `2px solid ${titlePosition === 'rightTop' ? '#6B66FF' : '#e2e8f0'}`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              padding: '8px',
              cursor: 'pointer',
              backgroundColor: titlePosition === 'rightTop' ? 'rgba(107, 102, 255, 0.05)' : 'white',
              position: 'relative'
            }}
          >
            <div style={{ 
              fontSize: '0.7rem',
              fontWeight: titlePosition === 'rightTop' ? 'bold' : 'normal',
              color: '#4A5568'
            }}>右上</div>
            <div style={{
              position: 'absolute',
              bottom: '5px',
              right: '5px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: titlePosition === 'rightTop' ? '#6B66FF' : 'transparent'
            }}></div>
          </div>
          
          {/* 上方 */}
          <div 
            onClick={() => setTitlePosition('top')}
            style={{
              width: '80px',
              height: '60px',
              border: `2px solid ${titlePosition === 'top' ? '#6B66FF' : '#e2e8f0'}`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              padding: '8px',
              cursor: 'pointer',
              backgroundColor: titlePosition === 'top' ? 'rgba(107, 102, 255, 0.05)' : 'white',
              position: 'relative'
            }}
          >
            <div style={{ 
              fontSize: '0.7rem',
              fontWeight: titlePosition === 'top' ? 'bold' : 'normal',
              color: '#4A5568'
            }}>上方</div>
            <div style={{
              position: 'absolute',
              bottom: '5px',
              right: '5px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: titlePosition === 'top' ? '#6B66FF' : 'transparent'
            }}></div>
          </div>
          
          {/* 左下 */}
          <div 
            onClick={() => setTitlePosition('leftBottom')}
            style={{
              width: '80px',
              height: '60px',
              border: `2px solid ${titlePosition === 'leftBottom' ? '#6B66FF' : '#e2e8f0'}`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-start',
              padding: '8px',
              cursor: 'pointer',
              backgroundColor: titlePosition === 'leftBottom' ? 'rgba(107, 102, 255, 0.05)' : 'white',
              position: 'relative'
            }}
          >
            <div style={{ 
              fontSize: '0.7rem',
              fontWeight: titlePosition === 'leftBottom' ? 'bold' : 'normal',
              color: '#4A5568'
            }}>左下</div>
            <div style={{
              position: 'absolute',
              bottom: '5px',
              right: '5px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: titlePosition === 'leftBottom' ? '#6B66FF' : 'transparent'
            }}></div>
          </div>
          
          {/* 右下 */}
          <div 
            onClick={() => setTitlePosition('rightBottom')}
            style={{
              width: '80px',
              height: '60px',
              border: `2px solid ${titlePosition === 'rightBottom' ? '#6B66FF' : '#e2e8f0'}`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              padding: '8px',
              cursor: 'pointer',
              backgroundColor: titlePosition === 'rightBottom' ? 'rgba(107, 102, 255, 0.05)' : 'white',
              position: 'relative'
            }}
          >
            <div style={{ 
              fontSize: '0.7rem',
              fontWeight: titlePosition === 'rightBottom' ? 'bold' : 'normal',
              color: '#4A5568'
            }}>右下</div>
            <div style={{
              position: 'absolute',
              bottom: '5px',
              right: '5px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: titlePosition === 'rightBottom' ? '#6B66FF' : 'transparent'
            }}></div>
          </div>
          
          {/* 下方 */}
          <div 
            onClick={() => setTitlePosition('bottom')}
            style={{
              width: '80px',
              height: '60px',
              border: `2px solid ${titlePosition === 'bottom' ? '#6B66FF' : '#e2e8f0'}`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              padding: '8px',
              cursor: 'pointer',
              backgroundColor: titlePosition === 'bottom' ? 'rgba(107, 102, 255, 0.05)' : 'white',
              position: 'relative'
            }}
          >
            <div style={{ 
              fontSize: '0.7rem',
              fontWeight: titlePosition === 'bottom' ? 'bold' : 'normal',
              color: '#4A5568'
            }}>下方</div>
            <div style={{
              position: 'absolute',
              bottom: '5px',
              right: '5px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: titlePosition === 'bottom' ? '#6B66FF' : 'transparent'
            }}></div>
          </div>
          
          {/* 居中 */}
          <div 
            onClick={() => setTitlePosition('center')}
            style={{
              width: '80px',
              height: '60px',
              border: `2px solid ${titlePosition === 'center' ? '#6B66FF' : '#e2e8f0'}`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              cursor: 'pointer',
              backgroundColor: titlePosition === 'center' ? 'rgba(107, 102, 255, 0.05)' : 'white',
              position: 'relative'
            }}
          >
            <div style={{ 
              fontSize: '0.7rem',
              fontWeight: titlePosition === 'center' ? 'bold' : 'normal',
              color: '#4A5568'
            }}>居中</div>
            <div style={{
              position: 'absolute',
              bottom: '5px',
              right: '5px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: titlePosition === 'center' ? '#6B66FF' : 'transparent'
            }}></div>
          </div>
          </div>
        </div>
      </div>
      
      {/* 视频设置 */}
      <div style={{ marginTop: '20px' }}>
        <h4 style={{ marginBottom: '10px', fontSize: '1rem', color: '#4A5568', textAlign: 'center' }}>视频设置</h4>
        <div style={{ 
          display: 'flex', 
          gap: '20px',
          marginBottom: '15px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {/* 视频码率 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '10px',
            backgroundColor: '#f7fafc',
            borderRadius: '8px',
            minWidth: '200px',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '0.9rem', color: '#718096', whiteSpace: 'nowrap' }}>视频码率:</span>
            <input 
              type="number" 
              min="1"
              max="20"
              value={videoBitrate}
              onChange={handleVideoBitrateChange}
              style={{
                width: '60px',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            />
            <span style={{ fontSize: '0.9rem', color: '#718096' }}>Mbps</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LyricsStyleSelector;
