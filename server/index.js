const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { analyzeMusic } = require('./genai-analyze');

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
  const apiKey = req.query.gemini_key;
  if (!apiKey) {
    return res.status(400).json({ error: '请提供 Gemini API Key' });
  }

  try {
    // 使用上传后的文件名（已经是时间戳格式）作为安全的文件名
    const filePath = req.file.path;
    const fileName = path.basename(filePath); // 使用上传后的安全文件名

    console.log('# upload as localfile done, path ', filePath);
    const result = await analyzeMusic(filePath, apiKey);
    
    // 增加分析次数
    stats.analyses += 1;
    
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
