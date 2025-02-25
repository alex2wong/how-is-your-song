export const apiBase = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : '/api';

// 评分等级的 UI 样式
export const scoreClassStyles = (score) => {
    let classTxt = '优秀';
    let className = 'exellent';
    let bgColor = '#4CAF50'; // 默认绿色

    if (!score) { 
      return  {
        classTxt,
        className,
        bgColor
      }
    }

    if (score >= 8) {
        classTxt = '很优秀'
        className = 'exellent'
        bgColor = '#4CAF50' // 绿色
      } else if (score >= 6) {
        classTxt = '还不错'
        className = 'good'
        bgColor = '#ffbc05' // 黄色
      } else {
        classTxt = '较一般'
        className = 'normal'
        bgColor = '#ff3c00' // 红色
      }
    return {
        classTxt,
        className,
        bgColor
    }
}

// export const getShareLinkforSong = (songId) => {
//   return `https://${location.host}/song/${songId}`
// }

export const copyShareLinkforSong = (songId) => {
  navigator.clipboard.writeText(`https://${location.host}/song/${songId}`);
  alert('链接已复制到剪贴板');
}