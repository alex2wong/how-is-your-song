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

// 根据authorName生成一致的颜色
export const getAuthorNameColor = (authorName) => {
  if (!authorName) return { bgColor: '#e8f5ff', textColor: '#1890ff', borderColor: '#91d5ff' };
  
  // 使用简单的哈希算法将authorName转换为数字
  let hash = 0;
  for (let i = 0; i < authorName.length; i++) {
    hash = authorName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // 将哈希值转换为HSL颜色
  // 使用HSL可以更好地控制颜色的亮度和饱和度，避免过暗或过亮的颜色
  const h = Math.abs(hash) % 360; // 色相 0-359
  const s = 70 + (Math.abs(hash) % 20); // 饱和度 70-89%，保持颜色鲜艳
  const l = 65 + (Math.abs(hash) % 15); // 亮度 65-79%，避免太暗或太亮
  
  // 生成背景色、文字色和边框色
  const bgColor = `hsl(${h}, ${s}%, ${l}%)`;
  
  // 计算对比色作为文字颜色，确保文字清晰可见
  const textColor = l > 70 ? '#333333' : '#ffffff';
  
  // 边框色使用稍微深一点的背景色
  const borderColor = `hsl(${h}, ${s}%, ${l - 10}%)`;
  
  return { bgColor, textColor, borderColor };
};

// export const getShareLinkforSong = (songId) => {
//   return `https://${location.host}/song/${songId}`
// }

export const copyShareLinkforSong = (songId) => {
  navigator.clipboard.writeText(`https://${location.host}/song/${songId}`);
  alert('链接已复制到剪贴板');
}