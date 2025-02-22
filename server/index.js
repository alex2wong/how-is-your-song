const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { analyzeMusic } = require('./genai-analyze');
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
if (!fs.existsSync(uploadsDir)){
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

// 处理音频文件上传
app.post('/api/analyze', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('未上传文件');
  }
  let apiKey = req.query.gemini_key;
  if (!apiKey) {
    apiKey = process.env.APIKEY.split(',')[Date.now() % process.env.APIKEY.split(',').length];
  }

  try {
    // 使用上传后的文件名（已经是时间戳格式）作为安全的文件名
    const filePath = req.file.path;
    const fileName = path.basename(filePath); // 使用上传后的安全文件名

    console.log('# upload as localfile done, path ', filePath, fileName);
    const result = await analyzeMusic(filePath, apiKey);
    
    // 增加分析次数
    stats.analyses += 1;

    // 根据result中的"song_name"和"overall_score": 8.3, 字段，制作一个仅显示前30名的排行榜，保存到本地，并在stats api中返回
    if (result.song_name && result.overall_score) {
      const rank = stats.rank || [];
      rank.push({ song_name: result.song_name, overall_score: result.overall_score });
      rank.sort((a, b) => b.overall_score - a.overall_score);
      rank.length = 30;
      stats.rank = rank;
    }
    
    // 在返回结果中使用原始文件名
    res.json({
      ...result,
      song_name: req.query.file_name || '未知歌曲'
    });
  } catch (error) {
    console.error('分析失败:', error);
    res.status(500).json({ error: '分析失败: ' + error.message });
  } finally {
    // 删除上传的文件
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('删除文件失败:', err);
      });
    }
  }
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
}); 
