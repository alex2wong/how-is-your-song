/**
 * 支付中间件
 * 用于处理支付通知和更新用户积分
 */
const crypto = require('crypto');
const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

/**
 * 验证支付宝通知签名
 * @param {Object} params 支付宝通知参数
 * @param {String} publicKey 支付宝公钥
 * @returns {Boolean} 签名是否有效
 */
const verifyAlipaySignature = (params, publicKey) => {
  try {
    // 从通知参数中提取签名
    const sign = params.sign;
    delete params.sign;
    delete params.sign_type;
    
    // 按字母顺序排序所有参数
    const sortedParams = Object.keys(params).sort().map(key => {
      return `${key}=${params[key]}`;
    }).join('&');
    
    // 使用支付宝公钥验证签名
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(sortedParams, 'utf8');
    return verify.verify(publicKey, sign, 'base64');
  } catch (error) {
    console.error('验证支付宝签名错误:', error);
    return false;
  }
};

/**
 * 验证微信支付通知签名
 * @param {Object} params 微信支付通知参数
 * @param {String} key 微信支付API密钥
 * @returns {Boolean} 签名是否有效
 */
const verifyWxpaySignature = (params, key) => {
  try {
    // 从通知参数中提取签名
    const sign = params.sign;
    delete params.sign;
    
    // 按字母顺序排序所有参数
    const sortedParams = Object.keys(params).sort().map(key => {
      if (params[key] !== '' && params[key] !== undefined) {
        return `${key}=${params[key]}`;
      }
      return '';
    }).filter(item => item).join('&');
    
    // 拼接API密钥
    const stringSignTemp = `${sortedParams}&key=${key}`;
    
    // 计算MD5签名
    const md5Sign = crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase();
    
    return md5Sign === sign;
  } catch (error) {
    console.error('验证微信支付签名错误:', error);
    return false;
  }
};

/**
 * 更新订单状态
 * @param {String} orderId 订单ID
 * @param {String} status 订单状态 (success, failed)
 * @param {String} transactionId 支付平台交易ID
 * @returns {Promise<Boolean>} 更新是否成功
 */
const updateOrderStatus = async (orderId, status, transactionId) => {
  try {
    const db = await getDb();
    const result = await db.collection('orders').updateOne(
      { orderId },
      { 
        $set: { 
          status, 
          transactionId,
          paidAt: status === 'success' ? new Date() : null,
          updatedAt: new Date()
        } 
      }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('更新订单状态错误:', error);
    return false;
  }
};

/**
 * 更新用户积分
 * @param {String} userId 用户ID
 * @param {Number} credits 要添加的积分数量
 * @returns {Promise<Boolean>} 更新是否成功
 */
const updateUserCredits = async (userId, credits) => {
  try {
    const db = await getDb();
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { credits } }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('更新用户积分错误:', error);
    return false;
  }
};

/**
 * 处理支付成功
 * @param {String} orderId 订单ID
 * @param {String} transactionId 支付平台交易ID
 * @returns {Promise<Boolean>} 处理是否成功
 */
const handlePaymentSuccess = async (orderId, transactionId) => {
  try {
    const db = await getDb();
    
    // 查找订单
    const order = await db.collection('orders').findOne({ orderId });
    
    if (!order) {
      console.error('找不到订单:', orderId);
      return false;
    }
    
    // 检查订单是否已经处理过
    if (order.status === 'success') {
      console.log('订单已处理:', orderId);
      return true;
    }
    
    // 更新订单状态
    const orderUpdated = await updateOrderStatus(orderId, 'success', transactionId);
    
    if (!orderUpdated) {
      console.error('更新订单状态失败:', orderId);
      return false;
    }
    
    // 更新用户积分
    const userUpdated = await updateUserCredits(order.userId, order.credits);
    
    if (!userUpdated) {
      console.error('更新用户积分失败:', order.userId);
      return false;
    }
    
    console.log(`支付成功处理完成: 订单 ${orderId}, 用户 ${order.userId}, 积分 +${order.credits}`);
    return true;
  } catch (error) {
    console.error('处理支付成功错误:', error);
    return false;
  }
};

module.exports = {
  verifyAlipaySignature,
  verifyWxpaySignature,
  updateOrderStatus,
  updateUserCredits,
  handlePaymentSuccess
};
