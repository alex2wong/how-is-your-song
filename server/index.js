const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { analyzeMusic } = require('./genai-analyze');

const router = express.Router();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

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
app.post('/api/upload', upload.single('audio'), async (req, res) => {
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
//   res.json(result);

//   // 这里是一个模拟的评分系统
//   const rating = {
//     score: result['overall_score'], // 60-100的随机分数
//     comments: [
//         result['comments']
//     ],
//     arrangement: {
//         score: result['arrangement']['score'],
//         comments: result['arrangement']['comments']
//     },
//     vocal: {
//         score: result['vocal']['score'],
//         comments: result['vocal']['comments']
//     },
//     melody: {
//         score: result['melody']['score'],
//         comments: result['melody']['comments']
//     },
//     lyrics: {
//         score: result['lyrics']['score'],
//         comments: result['lyrics']['comments']
//     },
//     tags: result['tags']
//   };
  
  res.json(result);
});

// module.exports = router;

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
}); 