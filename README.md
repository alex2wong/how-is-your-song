# 音乐分析评价系统

试试你的音乐作品能得几分？

![页面截图](https://github.com/alex2wong/how-is-your-song/blob/main/screenshot-Music-Analyze.png?raw=true)
![页面截图2](https://github.com/alex2wong/how-is-your-song/blob/main/screenshot2-Music-Analyze.png?raw=true)

基于 Gemini AI 的音乐作品智能评分系统，可以从编曲、人声、旋律、歌词等多个维度对音乐作品进行专业分析和评价。

## 功能特点

- 支持上传音频文件进行分析
- 多维度专业评分（编曲、人声、旋律、歌词）
- 智能生成音乐标签
- 详细的专业点评
- 支持自定义 Gemini API Key
- 系统 Prompt Engineer 确保用户作品的评价标准统一

- [Todo] 音乐作品风格、乐器 Suno、Udio 提示词一键复制
- [Todo] 音乐评分后的结果一键分享，给朋友炫一下
- [Todo] 个人和全站历史评分排行榜

## 技术栈

- 前端：React + Vite
- 后端：Express + Node.js
- AI：Google Gemini AI 2.0 Pro Multi-Model

## 快速开始

1. 安装依赖：

   > npm install && cd server && npm install && cd ../

2. 启动开发服务器并且自动打开页面（http://localhost:5173）

   > npm run dev

3. 点击右上角设置按钮，配置你的 Gemini API Key.
   Gemini API Key [官网申请地址](https://aistudio.google.com/apikey)
