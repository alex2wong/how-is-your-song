const jwt = require('jsonwebtoken');
const { findUserById, findUserByIdentifier, verifyPassword, createUser, consumeCredits, refreshUserCredits } = require('./db');

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// 生成JWT令牌
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

// 验证JWT令牌
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// 认证中间件
const authMiddleware = async (req, res, next) => {
  // 从请求头或cookie中获取令牌
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
  
  if (!token) {
    return res.status(401).json({ success: false, message: '未授权，请先登录', requireAuth: true });
  }
  
  // 验证令牌
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: '令牌无效或已过期', requireAuth: true });
  }
  
  try {
    // 获取用户信息
    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: '用户不存在', requireAuth: true });
    }
    
    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    console.error('认证错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 积分检查中间件
const creditCheckMiddleware = async (req, res, next) => {
  // 每次API调用消耗的积分
  const CREDIT_COST = 10;
  
  try {
    // 检查用户积分是否足够
    if (req.user.credits < CREDIT_COST) {
      return res.status(403).json({ 
        success: false, 
        message: '今日积分额度已耗尽，请明天再试或充值积分',
        insufficientCredits: true
      });
    }
    
    // 标记需要消耗的积分，但不立即扣除
    // 只有在API调用成功后才会扣除
    req.creditCost = CREDIT_COST;
    next();
  } catch (error) {
    console.error('积分检查错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 刷新所有用户积分的函数
const refreshAllUserCredits = async () => {
  try {
    const result = await refreshUserCredits();
    console.log(`已刷新用户积分: ${result.modifiedCount} 个用户已更新`);
  } catch (error) {
    console.error('刷新用户积分失败:', error);
  }
};

// 每天凌晨自动刷新用户积分
const scheduleCreditsRefresh = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const timeUntilMidnight = tomorrow - now;
  
  // 设置定时器，在凌晨执行积分刷新
  setTimeout(() => {
    refreshAllUserCredits();
    // 之后每24小时执行一次
    setInterval(refreshAllUserCredits, 24 * 60 * 60 * 1000);
  }, timeUntilMidnight);
  
  console.log(`积分刷新计划已设置，将在 ${new Date(now.getTime() + timeUntilMidnight).toLocaleString()} 执行首次刷新`);
};

module.exports = {
  generateToken,
  verifyToken,
  authMiddleware,
  creditCheckMiddleware,
  refreshAllUserCredits,
  scheduleCreditsRefresh
};
