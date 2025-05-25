require('dotenv').config()

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { analyzeMusic, getLyrics } = require('./genai-analyze');
const { 
  connectToDb, 
  insertTags, 
  getTags, 
  insertSong, 
  getSongRank, 
  getSongById, 
  getSongsByName, 
  addLike, 
  removeLike, 
  getRankByLike, 
  getDb,
  getSongRankByIds, 
  calculateSongPercentiles, 
  getSongRankReverse, 
  updateSongLyrics,
  createUser,
  findUserByIdentifier,
  findUserById,
  verifyPassword,
  updateUserCredits,
  consumeCredits
} = require('./db');

const { 
  generateToken, 
  verifyToken, 
  authMiddleware, 
  creditCheckMiddleware, 
  refreshAllUserCredits,
  scheduleCreditsRefresh 
} = require('./auth');

const { handleGoogleCallback } = require('./googleAuth');

const app = express();
const port = 3000;

// 添加CORS支持，允许前端页面访问API
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

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

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 } // 7天
}));

// 启动时刷新所有用户积分
refreshAllUserCredits();
// 设置每日自动刷新积分
scheduleCreditsRefresh();

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
});

// 提供Google客户端ID
app.get('/api/auth/google-client-id', (req, res) => {
  res.json({ clientId: process.env.GOOGLE_CLIENT_ID });
});

// 用户认证相关API

// 手机验证码登录
app.post('/api/auth/phone-login', async (req, res) => {
  try {
    const { phone, verificationCode } = req.body;
    
    if (!phone || !verificationCode) {
      return res.status(400).json({ success: false, message: '手机号和验证码不能为空' });
    }
    
    // 在实际应用中，这里应该验证验证码是否正确
    // 这里简化处理，假设验证码是 '123456'
    if (verificationCode !== '123456') {
      return res.status(400).json({ success: false, message: '验证码错误' });
    }
    
    // 查找用户
    let user = await findUserByIdentifier(phone);
    
    // 如果用户不存在，创建新用户
    if (!user) {
      const userData = {
        phone,
        name: `用户${phone.substring(phone.length - 4)}`, // 使用手机号后4位作为默认用户名
      };
      
      try {
        const result = await createUser(userData);
        if (!result || !result.insertedId) {
          console.log('创建用户失败，无效的结果:', result);
          return res.status(500).json({ success: false, message: '创建用户失败' });
        }
        
        user = await findUserById(result.insertedId);
        if (!user) {
          console.log('创建用户后无法找到用户:', result.insertedId);
          return res.status(500).json({ success: false, message: '创建用户后无法找到用户' });
        }
      } catch (error) {
        console.error('创建用户错误:', error);
        return res.status(500).json({ success: false, message: '创建用户时发生错误' });
      }
    }
    
    // 生成JWT令牌
    const token = generateToken(user._id);
    
    // 设置cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    // 返回用户信息（不包含敏感数据）
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        credits: user.credits
      },
      token
    });
  } catch (error) {
    console.error('手机登录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// Google登录 - 旧的实现方式
app.post('/api/auth/google-login', async (req, res) => {
  try {
    const { googleToken, email, name } = req.body;
    
    if (!googleToken || !email) {
      return res.status(400).json({ success: false, message: '谷歌令牌和邮箱不能为空' });
    }
    
    console.log('收到Google登录请求:', { email, name });
    
    // 在实际应用中，这里应该验证谷歌令牌是否有效
    // 这里简化处理，假设令牌有效
    
    // 查找用户
    let user = await findUserByIdentifier(email);
    
    // 如果用户不存在，创建新用户
    if (!user) {
      const userData = {
        email,
        name: name || email.split('@')[0], // 使用邮箱前缀作为默认用户名
        googleId: googleToken // 在实际应用中，这应该是从谷歌验证响应中提取的ID
      };
      
      const result = await createUser(userData);
      user = await findUserById(result.insertedId);
    }
    
    // 生成JWT令牌
    const token = generateToken(user._id);
    
    // 设置cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    // 返回用户信息（不包含敏感数据）
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits
      },
      token
    });
  } catch (error) {
    console.error('谷歌登录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误: ' + error.message });
  }
});

// 新的 Google OAuth 回调处理 - 支持POST和GET请求
app.all('/api/auth/google/callback', async (req, res) => {
  console.log('收到Google回调请求:', {
    method: req.method,
    url: req.url,
    query: req.query,
    headers: req.headers,
    origin: req.headers.origin || 'unknown'
  });
  
  try {
    // 从请求中获取授权码，支持GET和POST请求
    let code = null;
    
    if (req.method === 'GET') {
      // 从查询参数中获取授权码
      code = req.query.code;
      console.log('收到GET请求的Google回调，授权码:', code);
    } else {
      // 从请求体中获取授权码
      code = req.body.code;
      console.log('收到POST请求的Google回调，授权码:', code);
    }
    
    if (!code) {
      console.error('授权码不能为空');
      return res.status(400).json({ success: false, message: '授权码不能为空' });
    }
    
    // 构建重定向URI（与前端使用的相同）
    const redirectUri = 'https://aiyueping.com/auth/google/callback';
    console.log('使用重定向URI:', redirectUri);
    
    // 处理Google回调
    console.log('开始处理Google回调...');
    const result = await handleGoogleCallback(code, redirectUri);
    console.log('处理结果:', result.success ? '成功' : '失败');
    
    // 设置cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // 改为lax以允许跨域请求
      domain: 'localhost' // 指定域名为localhost
    });
    
    // 返回用户信息
    console.log('返回成功响应');
    return res.json(result);
  } catch (error) {
    console.error('Google回调处理错误:', error);
    return res.status(500).json({ 
      success: false, 
      message: '处理Google登录回调失败: ' + error.message,
      error: error.stack
    });
  }
});

// 获取当前用户信息
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    // 用户信息已在authMiddleware中添加到req对象
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        credits: req.user.credits
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 退出登录
app.post('/api/auth/logout', (req, res) => {
  // 清除cookie
  res.clearCookie('token');
  res.json({ success: true, message: '已成功退出登录' });
});

// 发送手机验证码
app.post('/api/auth/send-verification-code', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ success: false, message: '手机号不能为空' });
    }
    
    // 在实际应用中，这里应该发送真实的验证码
    // 这里简化处理，假设验证码总是 '123456'
    
    // 模拟发送验证码的延迟
    setTimeout(() => {
      console.log(`向 ${phone} 发送验证码: 123456`);
    }, 1000);
    
    res.json({ success: true, message: '验证码已发送' });
  } catch (error) {
    console.error('发送验证码错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取积分套餐列表
app.get('/api/credits/packages', async (req, res) => {
  try {
    // 套餐列表
    const packages = [
      { id: 'basic', name: '基础套餐', price: 10, credits: 100 },
      { id: 'standard', name: '标准套餐', price: 30, credits: 350 },
      { id: 'premium', name: '高级套餐', price: 50, credits: 650 },
      { id: 'ultimate', name: '旗舰套餐', price: 100, credits: 1500 }
    ];
    res.json({ success: true, packages });
  } catch (error) {
    console.error('获取积分套餐错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 创建支付订单
app.post('/api/payment/create-order', authMiddleware, async (req, res) => {
  try {
    const { amount, paymentMethod = 'alipay' } = req.body;
    const userId = req.user._id;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: '请输入有效的充值金额' });
    }
    
    // 生成包含用户ID的订单号
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderId = `ORDER${timestamp}${random}_${userId}`;
    
    // 计算积分（每1元充值10积分）
    const credits = amount * 10;
    
    // 获取基础URL
    const host = `${req.protocol}://${req.get('host')}`;
    
    // 构建支付参数
    const params = {
      pid: process.env.PAYMENT_ID || '', // 商户ID
      type: paymentMethod, // 支付方式：alipay或wxpay
      out_trade_no: orderId, // 订单号
      notify_url: `${host}/api/payment/notify`, // 异步通知地址
      return_url: `${host}/api/payment/result`, // 同步跳转地址
      name: `充值${credits}积分`, // 商品名称
      money: amount.toFixed(2), // 金额
      timestamp: Math.floor(Date.now() / 1000).toString() // 时间戳，秒级，转换为字符串
    };
    
    // 生成签名
    const crypto = require('crypto');
    
    // 完全按照SDK的方式生成签名
    console.log('========== 支付签名调试信息 ==========');
    console.log('原始参数:', params);
    
    // 1. 按照参数名字母升序排序
    const sortedKeys = Object.keys(params).sort();
    console.log('排序后的参数名:', sortedKeys);
    
    // 2. 拼接成key=value&key=value的形式
    let signStr = '';
    
    for (const key of sortedKeys) {
      // 使用isEmpty函数检查空值，与SDK保持一致
      const isEmpty = value => value === null || value === undefined || String(value).trim() === '';
      
      if (!isEmpty(params[key]) && key !== 'sign' && key !== 'sign_type') {
        signStr += '&' + key + '=' + params[key];
      }
    }
    
    // 去掉第一个&
    signStr = signStr.substring(1);
    console.log('待签名字符串:', signStr);
    
    // 3. 使用商户私钥生成RSA签名
    const rawPrivateKey = process.env.PAYMENT_PK || '';
    console.log('私钥长度:', rawPrivateKey.length);
    
    try {
      // 使用wordwrap函数将私钥按照每行64个字符进行格式化
      const wordwrap = (str, width) => {
        const regex = new RegExp(`(.{1,${width}})`, 'g');
        return str.match(regex).join('\n');
      };
      
      const formattedKey = wordwrap(rawPrivateKey, 64);
      
      // 使用BEGIN PRIVATE KEY格式
      const pemPrivateKey = `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----`;
      console.log('PEM格式私钥结构:', pemPrivateKey.substring(0, 100) + '...');
      
      // 使用SHA256WithRSA算法生成签名，与SDK的openssl_sign函数保持一致
      const sign = crypto.createSign('SHA256')
        .update(signStr)
        .sign(pemPrivateKey, 'base64');
      
      console.log('生成的RSA签名:', sign);
      console.log('签名长度:', sign.length);
      console.log('========== 支付签名调试信息结束 ==========');
      
      // 设置签名参数
      params.sign = sign;
      params.sign_type = 'RSA'; // 使用RSA签名类型，与SDK保持一致
    } catch (error) {
      console.error('生成签名错误:', error);
      throw error;
    }
    
    // 保存订单信息到数据库
    const db = await getDb();
    await db.collection('orders').insertOne({
      orderId,
      userId,
      amount: parseFloat(amount),
      credits,
      paymentMethod,
      status: 'pending',
      createdAt: new Date()
    });
    
    // 返回支付参数
    res.json({
      success: true,
      params, // 直接返回支付参数
      orderId,
      amount,
      credits
    });
  } catch (error) {
    console.error('创建支付订单错误:', error);
    res.status(500).json({ success: false, message: '创建订单失败，请稍后再试' });
  }
});

// 支付通知处理 - 易支付接口
app.get('/api/payment/notify', async (req, res) => {
  try {
    const notifyData = req.query;
    console.log('收到支付通知:', notifyData);
    
    // 验证必要参数
    if (!notifyData.out_trade_no || !notifyData.trade_no || !notifyData.trade_status) {
      console.error('支付通知参数不完整');
      return res.send('fail');
    }
    
    // 检查交易状态
    if (notifyData.trade_status !== 'TRADE_SUCCESS') {
      console.log(`支付状态不是成功: ${notifyData.trade_status}`);
      return res.send('fail');
    }
    
    // 解析订单号和金额
    const orderId = notifyData.out_trade_no;
    const amount = parseFloat(notifyData.money);
    
    // 查询订单信息
    const db = await getDb();
    const order = await db.collection('orders').findOne({ orderId });
    
    // 如果订单存在，使用订单中的用户ID和积分
    if (order) {
      // 如果订单已完成，直接返回成功
      if (order.status === 'completed') {
        console.log(`订单已处理: ${orderId}`);
        return res.send('success');
      }
      
      // 更新订单状态
      await db.collection('orders').updateOne(
        { orderId },
        { $set: { status: 'completed', paidAt: new Date() } }
      );
      
      // 更新用户积分
      await updateUserCredits(order.userId, order.credits);
      
      console.log(`支付成功: 用户 ${order.userId} 充值 ${order.amount} 元，获得 ${order.credits} 积分`);
    } else {
      // 如果订单不存在，从订单号提取用户ID
      console.log(`处理未存储的订单: ${orderId}`);
      
      // 订单号格式应为 ORDER{timestamp}{random}_{userId}
      const orderParts = orderId.split('_');
      if (orderParts.length < 2) {
        console.error(`订单号格式错误: ${orderId}`);
        return res.send('fail');
      }
      
      const userId = orderParts[1];
      console.log(`从订单号提取的用户ID: ${userId}`);
      
      // 根据充值金额计算积分
      // 充值套餐：
      // 10元 = 100积分（基础套餐）
      // 30元 = 350积分（标准套餐）
      // 50元 = 650积分（高级套餐）
      // 100元 = 1500积分（旗舰套餐）
      let credits = 0;
      
      if (amount === 10) {
        credits = 100; // 基础套餐
      } else if (amount === 30) {
        credits = 350; // 标准套餐
      } else if (amount === 50) {
        credits = 650; // 高级套餐
      } else if (amount === 100) {
        credits = 1500; // 旗舰套餐
      } else {
        // 如果不是标准套餐，按照每1元=10积分计算
        credits = Math.floor(amount * 10);
      }
      
      console.log(`根据金额 ${amount} 元计算积分: ${credits}`)
      
      // 更新用户积分
      await updateUserCredits(userId, credits);
      
      // 保存订单记录
      await db.collection('orders').insertOne({
        orderId,
        userId,
        amount,
        credits,
        status: 'completed',
        paymentMethod: notifyData.type || 'alipay',
        paidAt: new Date(),
        createdAt: new Date()
      });
      
      console.log(`支付成功(新订单): 用户 ${userId} 充值 ${amount} 元，获得 ${credits} 积分`);
    }
    
    res.send('success');
  } catch (error) {
    console.error('处理支付通知错误:', error);
    res.send('fail');
  }
});

// 支付结果页面跳转
app.get('/api/payment/result', async (req, res) => {
  try {
    console.log('\n====== 收到支付结果跳转 ======');
    console.log('支付结果参数:', JSON.stringify(req.query, null, 2));
    
    // 验证必要参数
    const notifyData = req.query;
    if (!notifyData.out_trade_no || !notifyData.trade_no || !notifyData.trade_status) {
      console.error('支付结果参数不完整');
      return res.redirect('/?payment=incomplete');
    }
    
    // 检查交易状态
    if (notifyData.trade_status !== 'TRADE_SUCCESS') {
      console.log(`支付状态不是成功: ${notifyData.trade_status}`);
      return res.redirect(`/?payment=failed&status=${notifyData.trade_status}`);
    }
    
    // 解析订单号和金额
    const orderId = notifyData.out_trade_no;
    const amount = parseFloat(notifyData.money);
    console.log(`订单号: ${orderId}, 金额: ${amount}`);
    
    // 查询订单信息
    const db = await getDb();
    const order = await db.collection('orders').findOne({ orderId });
    console.log('查询到的订单:', order ? JSON.stringify(order, null, 2) : '未找到订单');
    
    // 如果订单存在，使用订单中的用户ID和积分
    if (order) {
      // 如果订单已完成，直接返回成功
      if (order.status === 'completed') {
        console.log(`订单已处理: ${orderId}`);
        return res.redirect('/?payment=already-processed');
      }
      
      // 更新订单状态
      await db.collection('orders').updateOne(
        { orderId },
        { $set: { status: 'completed', paidAt: new Date() } }
      );
      
      // 更新用户积分
      const updateResult = await updateUserCredits(order.userId, order.credits);
      console.log(`用户积分更新结果:`, updateResult ? JSON.stringify(updateResult, null, 2) : '更新失败');
      
      console.log(`支付成功: 用户 ${order.userId} 充值 ${order.amount} 元，获得 ${order.credits} 积分`);
      
      // 使用HTML表单自动提交到首页，确保跳转成功
      const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>支付成功</title>
        <meta http-equiv="refresh" content="0;url=/">
        <script type="text/javascript">
          window.onload = function() {
            window.location.href = '/?payment=success';
          }
        </script>
      </head>
      <body>
        <h1>支付成功，正在跳转...</h1>
        <p>如果没有自动跳转，请点击<a href="/?payment=success">这里</a></p>
      </body>
      </html>
      `;
      return res.send(html);
    } else {
      // 如果订单不存在，从订单号提取用户ID
      console.log(`处理未存储的订单: ${orderId}`);
      
      // 订单号格式应为 ORDER{timestamp}{random}_{userId}
      const orderParts = orderId.split('_');
      if (orderParts.length < 2) {
        console.error(`订单号格式错误: ${orderId}`);
        return res.redirect('/?payment=invalid-order');
      }
      
      const userId = orderParts[1];
      console.log(`从订单号提取的用户ID: ${userId}`);
      
      // 检查用户是否存在
      const user = await findUserById(userId);
      if (!user) {
        console.error(`找不到用户: ${userId}`);
        return res.redirect('/?payment=user-not-found');
      }
      console.log(`找到用户: ${userId}, 当前积分: ${user.credits || 0}`);
      
      // 根据充值金额计算积分
      let credits = 0;
      
      if (amount === 10) {
        credits = 100; // 基础套餐
      } else if (amount === 30) {
        credits = 350; // 标准套餐
      } else if (amount === 50) {
        credits = 650; // 高级套餐
      } else if (amount === 100) {
        credits = 1500; // 旗舰套餐
      } else {
        // 如果不是标准套餐，按照每1元=10积分计算
        credits = Math.floor(amount * 10);
      }
      
      console.log(`根据金额 ${amount} 元计算积分: ${credits}`);
      
      try {
        // 直接使用原子操作更新用户积分，避免使用updateUserCredits函数可能存在的问题
        const updateDirectResult = await db.collection('users').updateOne(
          { _id: new ObjectId(userId) },
          { $inc: { credits: credits }, $set: { lastUpdated: Date.now() } }
        );
        
        console.log(`直接更新用户积分结果:`, JSON.stringify(updateDirectResult, null, 2));
        
        // 同时仍然调用updateUserCredits函数以便于调试
        const updateResult = await updateUserCredits(userId, credits);
        console.log(`updateUserCredits函数返回结果:`, updateResult ? JSON.stringify(updateResult, null, 2) : '更新失败');
        
        // 查询更新后的用户信息
        const updatedUser = await findUserById(userId);
        console.log(`更新后的用户信息: 用户ID=${userId}, 积分=${updatedUser ? updatedUser.credits : '未知'}`);
        
        // 保存订单记录
        const orderResult = await db.collection('orders').insertOne({
          orderId,
          userId,
          amount,
          credits,
          status: 'completed',
          paymentMethod: notifyData.type || 'alipay',
          paidAt: new Date(),
          createdAt: new Date()
        });
        
        console.log(`订单保存结果:`, JSON.stringify(orderResult, null, 2));
        console.log(`支付成功(新订单): 用户 ${userId} 充值 ${amount} 元，获得 ${credits} 积分`);
        
        // 使用HTML表单自动提交到首页，确保跳转成功
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>支付成功</title>
          <meta http-equiv="refresh" content="0;url=/">
          <script type="text/javascript">
            window.onload = function() {
              window.location.href = '/?payment=success';
            }
          </script>
        </head>
        <body>
          <h1>支付成功，正在跳转...</h1>
          <p>如果没有自动跳转，请点击<a href="/?payment=success">这里</a></p>
        </body>
        </html>
        `;
        return res.send(html);
      } catch (updateError) {
        console.error('更新用户积分错误:', updateError);
        return res.redirect('/?payment=update-error');
      }
    }
  } catch (error) {
    console.error('处理支付结果错误:', error);
    res.redirect('/?payment=error');
  }
});

// 获取用户订单历史
app.get('/api/credits/orders', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const { getUserOrderHistory } = require('./payment');
    const orders = await getUserOrderHistory(userId);
    
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('获取订单历史错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

app.get('/api/stats', (req, res) => {
  // 增加访问人次
  stats.visitors += 1;
  res.json(stats);
});

app.get('/api/rank', async (req, res) => {
  // 添加对 eventTag 参数的支持
  if (req.query.eventTag) {
    try {
      const db = await connectToDb();
      console.log('Fetching songs with eventTag:', req.query.eventTag);
      const songs = await db.collection('songs').find(
        { eventTag: req.query.eventTag },
        {
          projection: {
            song_name: 1,
            overall_score: 1,
            authorName: 1,
            likes: 1,
            _id: 1,
            eventTag: 1
          }
        }
      ).sort({ "overall_score": -1 }).limit(300).toArray();
      console.log(`Found ${songs.length} songs with eventTag: ${req.query.eventTag}`);
      return res.json(songs);
    } catch (error) {
      console.error('Error fetching songs by eventTag:', error);
      return res.status(500).json({ error: 'Failed to fetch songs by eventTag' });
    }
  }
  
  // 原有的标签和时间戳筛选逻辑
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
  await calculateSongPercentiles(req.params.id);
  const song = await getSongById(req.params.id);
  res.json(song);
});

// 处理音频文件上传
app.post('/api/analyze', upload.single('audio'), authMiddleware, creditCheckMiddleware, async (req, res) => {
  if (!req.file) {
    return res.status(400).send('未上传文件');
  }
  let apiKey = req.query.gemini_key;
  if (!apiKey) {
    apiKey = process.env.APIKEY.split(',')[Date.now() % process.env.APIKEY.split(',').length];
  }

  let authorName = req.query.author_name;

  const lyrics = req.body.lyrics;

  console.log('user lyrics', lyrics);

  const promptVersion = req.query.prompt_version;

  const modelName = req.query.model_name;
  
  // 获取活动标签
  const eventTag = req.query.event_tag;

  let privacyMode = Number(req.query.privacy_mode);
  let filePath;
  try {
    // 使用上传后的文件名（已经是时间戳格式）作为安全的文件名
    filePath = req.file.path;
    const fileName = path.basename(filePath); // 使用上传后的安全文件名

    console.log('# upload as localfile done, path ', filePath, fileName);
    let result = await analyzeMusic(filePath, apiKey, promptVersion, modelName, lyrics);

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
     // 去除文件名最后一个 .后缀
      result.song_name = result.song_name.replace(/\.[^/.]+$/, "");
      result.overall_score = Number((totalItem > 0 ? totalScore / totalItem : 0).toFixed(1));
      result.modelName = modelName;
      result.promptVersion = promptVersion;
      
      // 添加活动标签到结果中
      if (eventTag) {
        result.eventTag = eventTag;
      }

      const res = await insertSong(result);
      if (res.insertedId) {
        const percentiles = await calculateSongPercentiles(res.insertedId);
        result = { ...result, percentiles };
      }
      stats.rank = rank;
    }

    // 分析成功后扣除积分
    await consumeCredits(req.user._id, req.creditCost);
    
    // 获取更新后的用户信息
    const updatedUser = await findUserById(req.user._id);
    
    // 在响应中包含更新后的积分信息
    result.userCredits = updatedUser.credits;
    
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

app.post('/api/getLyrics', upload.single('audio'), authMiddleware, creditCheckMiddleware, async (req, res) => {
  console.log('# Request getLyrics: ', req.file, req.query.model_name);
  if (!req.file) {
    return res.status(400).send('未上传文件');
  }
  let apiKey = req.query.gemini_key;
  if (!apiKey) {
    apiKey = process.env.APIKEY.split(',')[Date.now() % process.env.APIKEY.split(',').length];
  }

  const modelName = req.query.model_name;

  let privacyMode = 1;
  let filePath;
  try {
    // 使用上传后的文件名（已经是时间戳格式）作为安全的文件名
    filePath = req.file.path;
    const fileName = path.basename(filePath); // 使用上传后的安全文件名

    console.log('# upload as localfile done, path ', filePath, fileName);
    let result = await getLyrics(filePath, apiKey, modelName);

    // 分析成功后扣除积分
    await consumeCredits(req.user._id, req.creditCost);
    
    // 获取更新后的用户信息
    const updatedUser = await findUserById(req.user._id);
    
    res.json({ 
      lyrics: result,
      userCredits: updatedUser.credits
    });
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

// 更新歌词API端点
app.post('/api/update-lyrics/:songId', async (req, res) => {
  console.log('# Updating lyrics for song: ', req.params.songId);
  try {
    const { songId } = req.params;
    const { lyrics } = req.body;
    
    if (!lyrics) {
      return res.status(400).json({ success: false, message: '歌词内容不能为空' });
    }
    
    await updateSongLyrics(songId, lyrics);
    res.status(200).json({ success: true, message: '歌词更新成功' });
  } catch (error) {
    console.error('更新歌词时出错:', error);
    res.status(500).json({ success: false, message: '更新歌词失败: ' + error.message });
  }
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