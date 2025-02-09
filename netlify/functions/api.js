const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');


// 创建新的 Express 应用实例
const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 导入原有的路由和逻辑
const mainApp = require('../../server');

// 将原有应用的路由和中间件复制到新实例
app.use('/.netlify/functions/api', mainApp);

// 导出 handler
exports.handler = serverless(app);

// const app = require('../../server/index'); // 你的 Express 应用

// module.exports.handler = serverless(app);