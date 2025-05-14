import React from 'react';
import { FaShare, FaCopy } from 'react-icons/fa';
import { copyShareLinkforSong, scoreClassStyles } from '../utils';
import { useToast } from "./ToastMessage/ToastContext";
import RadarChart from './chart';

const AnalysisResult = ({ rating }) => {
  if (!rating) return null;

  const { showToast } = useToast();

  const renderScoreClass = (rating) => {
    if (!rating || !rating.overall_score) {
      return '';
    }

    const score = rating.overall_score;
    let classTxt = '优秀';
    let className = 'score ';

    if (score >= 8) {
      classTxt = '很优秀';
      className += 'exellent';
    } else if (score >= 6) {
      classTxt = '还不错';
      className += 'good';
    } else {
      classTxt = '较一般';
      className += 'normal';
    }
    const songName = rating.song_name ? rating.song_name.replace(/\.[^/.]+$/, "") : '';
    
    return (
      <p>
        <span>《{songName}》 得分：</span>{' '}
        <span
          className={className}
          style={{ backgroundColor: scoreClassStyles(score).bgColor, color: '#ffffff' }}
        >
          {score} {classTxt}
        </span>
      </p>
    );
  };

  const renderDimensionsTable = (dimensions) => {
    if (!dimensions) {
      return null;
    }
    return (
      <table className="dimensions-table">
        <thead>
          <tr>
            <th style={{ width: 80 }}>维度</th>
            <th style={{ width: 50 }}>得分</th>
            <th>评论</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(dimensions).map(
            ([dimension, value]) =>
              value && (
                <tr className="dimension-row" key={dimension}>
                  <td>{dimension}</td>
                  <td>
                    <span
                      className="score"
                      style={{
                        backgroundColor: scoreClassStyles(value.score).bgColor,
                        color: '#ffffff',
                      }}
                    >
                      {value.score}
                    </span>
                  </td>
                  <td>{value.comments}</td>
                </tr>
              )
          )}
        </tbody>
      </table>
    );
  };

  const renderTags = (tags) => {
    if (!tags) {
      return null;
    }
    const tagList = tags.map((tag, index) => (
      <span key={index} className="tag">
        {tag}
      </span>
    ));
    return (
      <div>
        <h3>音乐标签</h3>
        <div style={{ position: 'relative', paddingRight: '60px' }}>
           <div  className='tags'>{tagList}</div>
           <FaCopy 
               className="copy-icon"
               onClick={() => {
                 const tagsString = tags.map(t=> t.replace('#', '')).join(', ');
                 navigator.clipboard.writeText(tagsString);
                 showToast('音乐标签已复制到剪贴板')
               }}
               style={{
                 position: 'absolute',
                 right: '20px',
                 top: '50%',
                 transform: 'translateY(-50%)',
                 cursor: 'pointer',
                 transition: 'opacity 0.2s ease',
                 color: '#555',
                 fontSize: '16px',
               }}
             />
        </div>
      </div>
    );
  };

  return (
    <div className="result-section">
      <div className="result-title">
        <div />
        <h2>分析结果</h2>
        <FaShare
          style={{
            width: '24px!important',
            height: '24px!important',
            cursor: 'pointer',
            color: '#555',
            marginRight: '24px',
          }}
          onClick={() => {
            copyShareLinkforSong(rating._id);
            showToast('链接已复制到剪贴板');
          }}
        />
      </div>
      <div className="score-row">{renderScoreClass(rating)}</div>
      <p className="summary-quote">{rating.comments}</p>
      <div className='score-row'>
        <RadarChart data={rating} />
      </div>
      <div>{renderTags(rating.tags || rating.labels)}</div>
      <div className="comments">
        <h3>详细解析</h3>
        <div>
          {renderDimensionsTable({
            编曲: rating.arrangement,
            人声: rating.vocal,
            结构: rating.melody_structure || rating.structure,
            歌词: rating.lyrics,
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
