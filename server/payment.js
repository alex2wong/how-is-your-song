/**
 * 支付模块 - 处理积分充值功能
 * 使用易支付接口
 */

require('dotenv').config();
const { findUserById, updateUserCredits, getDb } = require('./db');

/**
 * 处理支付通知
 * @param {Object} notifyData 支付通知数据
 * @returns {boolean} 处理结果
 */
async function handlePaymentNotify(notifyData) {
  try {
    console.log('收到支付通知数据:', notifyData);
    
    // 1. 验证必要参数
    if (!notifyData.out_trade_no || !notifyData.trade_no || !notifyData.trade_status) {
      console.error('支付通知参数不完整');
      return false;
    }
    
    // 2. 检查交易状态
    if (notifyData.trade_status !== 'TRADE_SUCCESS') {
      console.log(`支付通知状态不是成功: ${notifyData.trade_status}`);
      return false;
    }
    
    // 3. 解析订单号和金额
    const orderId = notifyData.out_trade_no;
    const amount = parseFloat(notifyData.money || '0');
    
    // 从订单号中提取用户ID
    // 订单号格式为 ORDER{timestamp}{random}_{userId}
    const orderParts = orderId.split('_');
    if (orderParts.length < 2) {
      console.error(`订单号格式错误: ${orderId}`);
      return false;
    }
    
    const userId = orderParts[1];
    
    // 4. 计算积分（每1元充值10积分）
    const credits = Math.floor(amount * 10);
    
    if (credits <= 0) {
      console.error(`无效的金额: ${amount}`);
      return false;
    }
    
    // 5. 更新用户积分
    await updateUserCredits(userId, credits);
    
    // 6. 记录订单信息
    const db = await getDb();
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
    
    console.log(`支付成功: 用户 ${userId} 充值 ${amount} 元，获得 ${credits} 积分`);
    return true;
  } catch (error) {
    console.error('处理支付通知错误:', error);
    return false;
  }
}

/**
 * 获取用户订单历史
 * @param {string} userId 用户ID
 * @returns {Array} 订单历史
 */
async function getUserOrderHistory(userId) {
  const db = await getDb();
  return db.collection('orders')
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
}

/**
 * 获取可用的积分套餐
 * @returns {Array} 积分套餐列表
 */
function getCreditPackages() {
  return CREDIT_PACKAGES;
}

module.exports = {
  createAlipayOrder,
  createWxpayOrder,
  createOrder,
  handlePaymentNotify,
  getUserOrderHistory,
  getCreditPackages
};
