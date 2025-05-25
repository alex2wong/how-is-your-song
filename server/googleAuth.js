// Google OAuth 处理函数
const axios = require('axios');
const { findUserByIdentifier, createUser, findUserById, findOrCreateUser } = require('./db');
const { generateToken } = require('./auth');

// 处理 Google 授权回调
const handleGoogleCallback = async (code, redirectUri) => {
  // 确保使用固定的重定向URI，与前端和Google Cloud Console配置一致
  redirectUri = 'https://aiyueping.com/auth/google/callback';
  console.log('使用重定向URI:', redirectUri);
  
  try {
    // 检查授权码是否有效
    if (!code || code.length < 10) {
      throw new Error('无效的授权码');
    }
    
    console.log('开始交换访问令牌...');
    
    // 1. 使用授权码交换访问令牌
    let tokenResponse;
    try {
      tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      });
      
      console.log('交换令牌成功');
    } catch (error) {
      console.error('交换令牌失败:', error.response?.data || error.message);
      
      // 如果是 invalid_grant 错误，说明授权码已经被使用过
      if (error.response?.data?.error === 'invalid_grant') {
        console.log('授权码已失效，请重新登录');
        throw new Error('授权码已失效，请重新登录');
      }
      
      // 其他错误直接抛出
      throw error;
    }

    const { access_token, id_token } = tokenResponse.data;
    console.log('获取到访问令牌，开始获取用户信息');

    // 2. 使用访问令牌获取用户信息
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    const { email, name, picture } = userInfoResponse.data;
    console.log('获取到用户信息:', { email, name });

    // 3. 查找或创建用户
    const userData = {
      email,
      name: name || email.split('@')[0],
      googleId: id_token,
      picture
    };
    
    console.log('尝试查找或创建用户:', email);
    const user = await findOrCreateUser(userData);
    console.log('获取到用户:', user ? user.email : '未找到用户');
    
    if (!user) {
      throw new Error('无法获取或创建用户');
    }

    // 4. 生成JWT令牌
    const token = generateToken(user._id);

    // 5. 返回用户信息和令牌
    return {
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits,
        picture: user.picture
      },
      token
    };
  } catch (error) {
    console.error('Google 授权回调处理失败:', error);
    throw error;
  }
};

module.exports = {
  handleGoogleCallback
};
