/**
 * 解析歌词时间轴
 * @param {string} lyricsText - 歌词文本
 * @returns {Array|null} 解析后的歌词数组或null（如果解析失败）
 */
export const parseLyrics = (lyricsText) => {
  const lyrics = [];
  // 支持\r\n和\n两种换行符

  const lines = lyricsText.replaceAll('\"', '').split(/\r\n|\n/).filter(line => line.trim() !== '');
  
  console.log('解析歌词，总行数:', lines.length);
  
  try {
    // 尝试解析JSON格式
    if (lyricsText.trim().startsWith('[') && lyricsText.includes('timestamp') && lyricsText.includes('text')) {
      try {
        // 尝试解析JSON数组格式
        const jsonLyrics = JSON.parse(lyricsText);
        
        if (Array.isArray(jsonLyrics) && jsonLyrics.length > 0 && jsonLyrics[0].timestamp && jsonLyrics[0].text) {
          // 处理包含timestamp和text字段的JSON数组
          for (const item of jsonLyrics) {
            if (!item.timestamp || !item.text) continue;
            
            // 解析时间戳 (格式: 00:12.66)
            const timeMatch = item.timestamp.match(/^(\d+):(\d+)\.(\d+)$/);
            
            if (timeMatch) {
              const minutes = parseInt(timeMatch[1]);
              const seconds = parseInt(timeMatch[2]);
              const milliseconds = parseInt(timeMatch[3]);
              
              const timeInSeconds = minutes * 60 + seconds + milliseconds / 100;
              
              lyrics.push({
                time: timeInSeconds,
                text: item.text.trim()
              });
            }
          }
          
          // 如果成功解析了歌词，直接返回
          if (lyrics.length > 0) {
            // 按时间排序
            lyrics.sort((a, b) => a.time - b.time);
            console.log('JSON数组格式歌词解析完成，共', lyrics.length, '条');
            return lyrics;
          }
        }
      } catch (e) {
        console.log('JSON解析失败，尝试其他格式', e);
        // JSON解析失败，继续尝试其他格式
      }
    }
    
    // 检测歌词格式
    const firstLine = lines[0].trim();
    const isBracketFormat = firstLine.startsWith('[') && firstLine.includes(']');
    const isSubtitleFormat = /^\d+$/.test(firstLine) && lines.length > 2 && lines[1].includes(' --> ');
    
    // 检查是否是带引号的整体LRC格式
    const isQuotedLrcFormat = lyricsText.startsWith('"') && lyricsText.endsWith('"') && 
                             lyricsText.includes('[') && lyricsText.includes(']');
    
    if (isQuotedLrcFormat) {
      // 处理带引号的整体LRC格式
      // 去除开头和结尾的引号，然后按换行符分割
      const content = lyricsText.substring(1, lyricsText.length - 1);
      const lrcLines = content.split(/\r\n|\n/).filter(line => line.trim() !== '');
      
      for (let i = 0; i < lrcLines.length; i++) {
        const line = lrcLines[i].trim();
        if (!line) continue;
        
        // 尝试匹配两种格式的时间戳
        const timeMatchWithMs = line.match(/^\[(\d+):(\d+)\.(\d+)\](.*)$/);
        const timeMatchNoMs = line.match(/^\[(\d+):(\d+)\](.*)$/);
        
        let minutes, seconds, milliseconds, lyricText, timeInSeconds;
        
        if (timeMatchWithMs) {
          minutes = parseInt(timeMatchWithMs[1]);
          seconds = parseInt(timeMatchWithMs[2]);
          milliseconds = parseInt(timeMatchWithMs[3]);
          lyricText = timeMatchWithMs[4].trim();
          
          timeInSeconds = minutes * 60 + seconds + milliseconds / 1000;
        } else if (timeMatchNoMs) {
          minutes = parseInt(timeMatchNoMs[1]);
          seconds = parseInt(timeMatchNoMs[2]);
          lyricText = timeMatchNoMs[3].trim();
          
          timeInSeconds = minutes * 60 + seconds;
        } else {
          console.error(`时间格式错误: "${line}"，应为 "[分:秒.毫秒]歌词" 或 "[分:秒]歌词" 格式`);
          continue;
        }
        
        lyrics.push({
          time: timeInSeconds,
          text: lyricText
        });
      }
    } else if (isBracketFormat) {
      // 处理带方括号的格式: [00:08.601]用夏天的雨水 或 [00:08]用夏天的雨水
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // 尝试匹配两种格式的时间戳
        // 1. [00:08.601] 格式 - 带毫秒
        // 2. [00:08] 格式 - 不带毫秒
        const timeMatchWithMs = line.match(/^\[(\d+):(\d+)\.(\d+)\](.*)$/);
        const timeMatchNoMs = line.match(/^\[(\d+):(\d+)\](.*)$/);
        
        let minutes, seconds, milliseconds, lyricText, timeInSeconds;
        
        if (timeMatchWithMs) {
          // 处理带毫秒的格式
          minutes = parseInt(timeMatchWithMs[1]);
          seconds = parseInt(timeMatchWithMs[2]);
          milliseconds = parseInt(timeMatchWithMs[3]);
          lyricText = timeMatchWithMs[4].trim();
          
          timeInSeconds = minutes * 60 + seconds + milliseconds / 1000;
        } else if (timeMatchNoMs) {
          // 处理不带毫秒的格式
          minutes = parseInt(timeMatchNoMs[1]);
          seconds = parseInt(timeMatchNoMs[2]);
          lyricText = timeMatchNoMs[3].trim();
          
          timeInSeconds = minutes * 60 + seconds;
        } else {
          console.error(`时间格式错误: "${line}"，应为 "[分:秒.毫秒]歌词" 或 "[分:秒]歌词" 格式`);
          continue; // 跳过错误行，继续解析
        }
        
        lyrics.push({
          time: timeInSeconds,
          text: lyricText
        });
      }
    } else if (isSubtitleFormat) {
      // 处理字幕格式: 1\n00:00:45,000 --> 00:00:50,100\n腐肉的味道 弥漫空气中
      for (let i = 0; i < lines.length; i += 3) {
        if (i + 2 >= lines.length) break;
        
        // 跳过序号行，直接处理时间行
        const timeLine = lines[i + 1].trim();
        const lyricText = lines[i + 2].trim();
        
        // 解析时间范围 (格式: 00:00:45,000 --> 00:00:50,100)
        const timeMatch = timeLine.match(/^(\d+):(\d+):(\d+),(\d+)\s*-->\s*(\d+):(\d+):(\d+),(\d+)$/);
        
        if (!timeMatch) {
          console.error(`时间格式错误: "${timeLine}"，应为 "时:分:秒,毫秒 --> 时:分:秒,毫秒" 格式`);
          continue; // 跳过错误行，继续解析
        }
        
        // 使用开始时间作为歌词时间点
        const hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const seconds = parseInt(timeMatch[3]);
        const milliseconds = parseInt(timeMatch[4]);
        
        const timeInSeconds = hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
        
        lyrics.push({
          time: timeInSeconds,
          text: lyricText
        });
      }
    } else {
      // 处理原始格式: 00:00.00 换行 (Intro - Saxophone)
      for (let i = 0; i < lines.length; i += 2) {
        if (i + 1 >= lines.length) break;
        
        const timeStr = lines[i].trim();
        const lyricText = lines[i + 1].trim();
        
        console.log(`解析歌词行 ${i}: 时间=${timeStr}, 文本=${lyricText}`);
        
        // 解析时间 (格式: 00:00.00)
        const timeMatch = timeStr.match(/^(\d+):(\d+)\.(\d+)$/);
        
        if (!timeMatch) {
          console.error(`时间格式错误: "${timeStr}"，应为 "分:秒.毫秒" 格式`);
          alert(`时间格式错误: "${timeStr}"，应为 "分:秒.毫秒" 格式`);
          return null;
        }
        
        const minutes = parseInt(timeMatch[1]);
        const seconds = parseInt(timeMatch[2]);
        const milliseconds = parseInt(timeMatch[3]);
        
        const timeInSeconds = minutes * 60 + seconds + milliseconds / 100;
        
        lyrics.push({
          time: timeInSeconds,
          text: lyricText
        });
      }
    }
    
    // 按时间排序
    lyrics.sort((a, b) => a.time - b.time);
    
    console.log('歌词解析完成，共', lyrics.length, '条');
    return lyrics;
  } catch (e) {
    console.error('歌词解析出错:', e);
    alert('歌词解析出错: ' + e.message);
    return null;
  }
};

/**
 * 示例歌词
 */
export const exampleLyrics = `00:00.00
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
