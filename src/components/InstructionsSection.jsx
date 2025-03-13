import React from 'react';
import { RiInformationLine, RiCheckboxCircleLine } from 'react-icons/ri';

const InstructionsSection = () => {
  return (
    <section className="instructions-section">
      <div className="section-title">
        <RiInformationLine style={{ color: '#5B86E5' }} />
        <h2>使用说明</h2>
      </div>

      <p style={{ color: 'var(--text-secondary)', textAlign: 'left' }}>基于 Google Gemini 2.0 Pro 多模态大模型的音乐作品智能评分系统，可以从编曲、人声、旋律、歌词等多个维度对音乐作品进行信息识别、分析评价</p>

      <h3 style={{ marginTop: '20px', textAlign: 'left' }}>主要功能：</h3>
      <div className="feature-list">
        <div className="feature-item">
          <RiCheckboxCircleLine style={{ color: '#5B86E5' }} />
          <span style={{ color: 'var(--text-secondary)' }}>支持上传音频文件进行分析</span>
        </div>
        <div className="feature-item">
          <RiCheckboxCircleLine style={{ color: '#5B86E5' }} />
          <span style={{ color: 'var(--text-secondary)' }}>提供整体评分和详细维度分析</span>
        </div>
        <div className="feature-item">
          <RiCheckboxCircleLine style={{ color: '#5B86E5' }} />
          <span style={{ color: 'var(--text-secondary)' }}>包含编曲、人声、旋律、歌词等多个维度</span>
        </div>
        <div className="feature-item">
          <RiCheckboxCircleLine style={{ color: '#5B86E5' }} />
          <span style={{ color: 'var(--text-secondary)' }}>生成音乐标签和风格分类</span>
        </div>
      </div>

      <h3 style={{ marginTop: '20px', textAlign: 'left' }}>使用方法：</h3>
      <div className="steps-list">
        <div className="step-item">
          <div className="step-number" style={{ backgroundColor: 'var(--secondary-gradient)', color: '#fff' }}>1</div>
          <div style={{ color: 'var(--text-secondary)', textAlign: 'left' }}>请访问 Google AI 申请独立 Gemini API Key，填入系统右上角的设置中（也可以不申请，但可能使用次数会受限）</div>
        </div>
        <div className="step-item">
          <div className="step-number" style={{ backgroundColor: 'var(--secondary-gradient)', color: '#fff' }}>2</div>
          <div style={{ color: 'var(--text-secondary)', textAlign: 'left' }}>点击选择文件上传音频，建议是音频格式 mp3、wav 等，也支持 MP4</div>
        </div>
        <div className="step-item">
          <div className="step-number" style={{ backgroundColor: 'var(--secondary-gradient)', color: '#fff' }}>3</div>
          <div style={{ color: 'var(--text-secondary)', textAlign: 'left' }}>等待系统分析完成，通常 20-30s</div>
        </div>
        <div className="step-item">
          <div className="step-number" style={{ backgroundColor: 'var(--secondary-gradient)', color: '#fff' }}>4</div>
          <div style={{ color: 'var(--text-secondary)', textAlign: 'left' }}>查看详细的分析结果</div>
        </div>
      </div>
    </section>
  );
};

export default InstructionsSection;
