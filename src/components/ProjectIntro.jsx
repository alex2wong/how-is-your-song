import { useState, useEffect } from 'react';

export const ProjectIntro = () => {
  // Initialize state from localStorage or default to true (expanded)
  const [isExpanded, setIsExpanded] = useState(() => {
    const savedState = localStorage.getItem('instructionsExpanded');
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  // Update localStorage when isExpanded changes
  useEffect(() => {
    localStorage.setItem('instructionsExpanded', JSON.stringify(isExpanded));
  }, [isExpanded]);

  // Handle toggle event
  const handleToggle = (e) => {
    setIsExpanded(e.target.open);
  };

  return(
    <details 
      className="readme-section" 
      open={isExpanded}
      onToggle={handleToggle}
    >
        <summary>使用说明</summary>
        <div className="readme-content">
          <h3>🎵 音乐智能分析系统</h3>
          <p>
            基于 Google Gemini 2.0 Pro
            多模态大模型的音乐作品智能评分系统，可以从编曲、人声、旋律、歌词等多个维度对音乐作品进行信息识别、分析评价
          </p>

          <h4>主要功能：</h4>
          <ul>
            <li>支持上传音频文件进行分析</li>
            <li>提供整体评分和详细维度分析</li>
            <li>包含编曲、人声、旋律、歌词等多个维度</li>
            <li>生成音乐标签和风格分类</li>
          </ul>

          <h4>使用方法：</h4>
          <ol>
            <li>
              建议访问{' '}
              <a target="__blank" href="https://aistudio.google.com/apikey">
                Google AI{' '}
              </a>{' '}
              申请独立 Gemini API Key，填入系统右上角的设置中
            </li>
            <li>
              点击选择文件上传音频，建议是音频格式 mp3、wav 等，也支持 MP4
            </li>
            <li>等待系统分析完成，通常 20-30s</li>
            <li>查看详细的分析结果</li>
          </ol>
        </div>
      </details>)
}