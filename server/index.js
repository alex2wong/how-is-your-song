const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { analyzeMusic } = require('./genai-analyze');
const { insertSong, getSongRank, getTags, getSongById, getSongRankReverse, getSongsByName, addLike, removeLike, getRankByLike, getSongRankByIds } = require('./db');
require('dotenv').config()

const app = express();
const port = 3000;

// 统计数据
let stats = {
  visitors: 0,
  analyses: 0
};

// 尝试从文件加载统计数据
const statsFile = path.join(__dirname, '../stats.json');
try {
  if (fs.existsSync(statsFile)) {
    stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
  }
} catch (error) {
  console.error('加载统计数据失败:', error);
}

// 定期保存统计数据到文件
setInterval(() => {
  try {
    fs.writeFileSync(statsFile, JSON.stringify(stats), 'utf8');
  } catch (error) {
    console.error('保存统计数据失败:', error);
  }
}, 5000);

app.use(cors());
app.use(express.json());

// 确保uploads目录存在
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    // 使用时间戳作为文件名，保留原始扩展名
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext)
  }
});

const upload = multer({ storage: storage });

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from API!' });
})

app.get('/api/stats', (req, res) => {
  // 增加访问人次
  stats.visitors += 1;
  res.json(stats);
});

app.get('/api/rank', async (req, res) => {
  const songs = await getSongRank(req.query.tag ? '#' + req.query.tag : undefined, req.query.timestamp);
  res.json(songs);
});

app.get('/api/rank-reverse', async (req, res) => {
  const songs = await getSongRankReverse();
  res.json(songs);
});

app.get('/api/tags', async (req, res) => {
  const tags = await getTags();
  res.json(tags);
});

app.get('/api/songs', async (req, res) => {
  const songs = await getSongsByName(req.query.name);
  res.json(songs);
});


// 支持的音频格式及其MIME类型映射
const audioMimeTypes = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.mp4': 'audio/mp4',
  '.aac': 'audio/aac',
  '.flac': 'audio/flac'
};

app.get('/api/audio/:uri', async (req, res) => {
  const uri = req.params.uri;
  const filePath = path.join(__dirname, 'uploads', uri);

  console.log('# Request song media by uri: ', req.params.uri, filePath);

  // 检查文件是否存在
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  // 获取文件扩展名并确定MIME类型
  const ext = path.extname(filePath).toLowerCase();
  const contentType = audioMimeTypes[ext] || 'application/octet-stream';

  // 获取文件大小
  const stat = fs.statSync(filePath);

  // 设置响应头
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Content-Disposition', 'inline');

  // 使用流式传输
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});

app.get('/api/song/:id', async (req, res) => {
  console.log('# Request song detail: ', req.params.id);
  const song = await getSongById(req.params.id);
  res.json(song);
});

// 处理音频文件上传
app.post('/api/analyze', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('未上传文件');
  }
  let apiKey = req.query.gemini_key;
  if (!apiKey) {
    apiKey = process.env.APIKEY.split(',')[Date.now() % process.env.APIKEY.split(',').length];
  }

  let authorName = req.query.author_name;

  const promptVersion = req.query.prompt_version;

  const modelName = req.query.model_name;

  let privacyMode = Number(req.query.privacy_mode);
  let filePath;
  try {
    // 使用上传后的文件名（已经是时间戳格式）作为安全的文件名
    filePath = req.file.path;
    const fileName = path.basename(filePath); // 使用上传后的安全文件名

    console.log('# upload as localfile done, path ', filePath, fileName);
    let result = await analyzeMusic(filePath, apiKey, promptVersion, modelName);

    // 在返回结果中使用原始文件名
    result = {
      ...result,
      authorName: authorName,
      song_name: req.query.file_name || '未知歌曲'
    };
    // 增加分析次数
    stats.analyses += 1;

    // 根据result中的"song_name"和"overall_score": 8.3, 字段，制作一个仅显示前30名的排行榜，保存到本地，并在stats api中返回
    if (result.song_name && result.overall_score && privacyMode !== 1) {
      const rank = stats.rank || [];
      rank.push({ song_name: result.song_name, overall_score: result.overall_score });
      rank.sort((a, b) => b.overall_score - a.overall_score);
      if (rank.length > 100) {
        rank.length = 100;
      }
      result.url = filePath;

      // re-calc overall_score
      let totalItem = 0;
      let totalScore = 0;
      if (result.arrangement?.score) {
        totalItem += 1;
        totalScore += result.arrangement.score;
      }
      if (result.vocal?.score) {
        totalItem += 1;
        totalScore += result.vocal.score;
      }
      if (result.structure?.score) {
        totalItem += 1;
        totalScore += result.structure.score;
      }
      if (result.lyrics?.score) {
        totalItem += 1;
        totalScore += result.lyrics.score;
      }
      result.overall_score = Number((totalItem > 0 ? totalScore / totalItem : 0).toFixed(1));

      await insertSong(result);

      stats.rank = rank;
    }

    res.json(result);
  } catch (error) {
    console.error('分析失败:', error);
    res.status(500).json({ error: '分析失败: ' + error.message });
  } finally {
    if (privacyMode === 1) {
      // 删除上传的文件
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('删除文件失败:', err);
        } else {
          console.log('文件删除成功', filePath);
        }
      });
    }
  }
});

// 2. 添加点赞功能
app.post('/api/like/add/:songId', async (req, res) => {
  console.log('# Adding like: ', req.params.songId);
  try {
    const { songId } = req.params;
    await addLike(songId);
    res.status(200).json({ success: true, message: 'Like added successfully' });
  } catch (error) {
    console.error('Error adding like:', error);
    res.status(500).json({ success: false, message: 'Failed to add like' });
  }
});

app.post('/api/like/remove/:songId', async (req, res) => {
  console.log('# Removing like: ', req.params.songId);
  try {
    const { songId } = req.params;
    await removeLike(songId);
    res.status(200).json({ success: true, message: 'Like removed successfully' });
  } catch (error) {
    console.error('Error removing like:', error);
    res.status(500).json({ success: false, message: 'Failed to remove like' });
  }
});

app.get('/api/rank-by-ids', async (req, res) => {
  const songIds = req.query.ids.split(',').map(id => id.trim());
  const songs = await getSongRankByIds(songIds);
  res.json(songs);
});

app.get('/api/rank-by-likes', async (req, res) => {
  const songs = await getRankByLike();
  res.json(songs);
});

const server = app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});

// 1. 修改服务器整体超时
server.timeout = 600000;  // 10分钟

// 2. 修改请求头超时
server.headersTimeout = 600000;  // 10分钟

// 3. 修改保持连接超时
server.keepAliveTimeout = 600000;  // 10分钟

// 4. 重要！设置 Node.js 的 http 模块超时时间
server.setTimeout(600000);  // 10分钟