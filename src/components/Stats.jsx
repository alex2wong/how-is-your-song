import React from 'react';

const Stats = ({ stats }) => {
  return (
    <footer style={{
      textAlign: 'center', 
      marginTop: '50px', 
      color: 'var(--text-secondary)', 
      padding: '20px 0'
    }}>
      <p>访问人次: {stats.visitors} | 分析次数: {stats.analyses}</p>
      <p style={{ marginTop: '10px' }}>© {new Date().getFullYear()} 爱乐评 - 音乐智能分析系统</p>
    </footer>
  );
};

export default Stats;
