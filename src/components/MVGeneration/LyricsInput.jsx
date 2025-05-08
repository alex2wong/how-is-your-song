import React, { useState } from 'react';
import { exampleLyrics } from './lyricsUtils';
import { RiAiGenerate } from 'react-icons/ri';
import { apiBase } from '../../api/analyze';

/**
 * 歌词输入组件
 */
const LyricsInput = ({ lyrics, setLyrics, selectedMusic }) => {
  const [isRecognizing, setIsRecognizing] = useState(false);
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#4A5568' }}>5. 输入带时间戳的歌词</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setLyrics(exampleLyrics)}
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
          <button 
            onClick={async () => {
              if (!selectedMusic) {
                alert('请先选择音乐文件');
                return;
              }
              
              try {
                setIsRecognizing(true);
                
                const formData = new FormData();
                formData.append('audio', selectedMusic);
                
                // 从localStorage中读取模型配置，与歌曲分析API保持一致
                const geminiKey = localStorage.getItem('gemini_key');
                const modelName = localStorage.getItem('model_name') || 'gemini-2.0-flash';
                
                // 构建API URL，包含模型名称和可能的API密钥
                const apiUrl = `${apiBase}/getLyrics?model_name=${modelName}${geminiKey ? `&gemini_key=${geminiKey}` : ''}`;
                
                const response = await fetch(apiUrl, {
                  method: 'POST',
                  body: formData
                });
                
                if (!response.ok) {
                  throw new Error(`识别失败: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('lyrics data:', data.lyrics);
                if (data.lyrics) {
                  // 所有返回的都是文本，需要判断是否是JSON格式
                  const text = data.lyrics;
                  try {
                    // 判断是否是JSON格式
                    if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
                      const parsedData = JSON.parse(text);
                      
                      if (Array.isArray(parsedData)) {
                        // 判断是否是包含 time 和 line 属性的歌词数组
                        if (parsedData.length > 0 && parsedData[0].time && parsedData[0].line) {
                          // 将数组转换为 LRC 格式
                          const lrcLines = parsedData.map(item => `[${item.time}]${item.line}`);
                          setLyrics(lrcLines.join('\n'));
                        } else {
                          // 普通数组，用换行符连接
                          setLyrics(parsedData.join('\n'));
                        }
                      } else if (typeof parsedData === 'object') {
                        // 如果是对象，获取所有值并用换行符连接
                        const values = Object.values(parsedData);
                        setLyrics(values.join('\n'));
                      } else {
                        // 其他情况直接使用原始文本
                        setLyrics(text);
                      }
                    } else {
                      // 不是JSON格式，直接使用
                      setLyrics(text);
                    }
                  } catch (e) {
                    // JSON解析失败，直接使用原始文本
                    console.log('解析JSON失败，使用原始文本', e);
                    setLyrics(text);
                  }
                }
              } catch (error) {
                console.error('识别歌词失败:', error);
                alert(`识别歌词失败: ${error.message}`);
              } finally {
                setIsRecognizing(false);
              }
            }}
            disabled={isRecognizing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'transparent',
              border: '1px solid rgb(52, 139, 165)',
              borderRadius: '12px',
              color: '#6B66FF',
              cursor: isRecognizing ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              opacity: isRecognizing ? 0.7 : 1
            }}
          >
            {isRecognizing ? '识别中...' : 'AI识别歌词'}
            {!isRecognizing && <RiAiGenerate />}
          </button>
        </div>
      </div>
      <textarea
        value={lyrics}
        onChange={(e) => setLyrics(e.target.value)}
        placeholder="请按照以下格式输入歌词时间轴：
[00:15.10]风从萧山吹过来，拥紧凉角冻结成雾海
[00:22.26]世人善也叹倾诉心中之音少人能懂
[00:29.28]月亮从云海走来，洒下碧血更有伤的白
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
  );
};

export default LyricsInput;
