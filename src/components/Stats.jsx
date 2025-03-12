import React from 'react';

const Stats = ({ stats }) => {
  return (
    <div 
      style={{
        position: 'fixed',
        left: '1rem',
        bottom: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        padding: '0.5rem',
        borderRadius: '4px',
        fontSize: '0.9rem',
        color: '#666'
      }}
    >
      <div>访问人次：{stats.visitors}</div>
      <div>分析次数：{stats.analyses}</div>
    </div>
  );
};

export default Stats;
