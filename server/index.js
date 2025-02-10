const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { analyzeMusic } = require('./genai-analyze');

const app = express();
const port = 3000;

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
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from API!' });
})

// 处理音频文件上传
app.post('/api/analyze', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('未上传文件');
  }
  const apiKey = req.query.gemini_key;
  if (!apiKey) {
    return res.status(400).json({ error: '请提供 Gemini API Key' });
  }

  // 假设音频文件上传成功, 调用 analyzeMusic
  const filePath = req.file.path;
  console.log('# upload as localfile done, path ', filePath);
  const result = await analyzeMusic(filePath, apiKey);
  res.json(result);
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
}); 
