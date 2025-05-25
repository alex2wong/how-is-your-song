import React, { useState } from 'react';
import { RiUser3Line, RiLogoutBoxRLine, RiCoinLine, RiAddCircleLine } from 'react-icons/ri';
import { useAuth } from './AuthContext';
import { fetchApi } from '../../utils/api';
import './UserInfo.css';

const UserInfo = () => {
  const { user, logout } = useAuth();
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 处理积分充值
  const handleRecharge = async (e) => {
    e.preventDefault();
    
    if (!rechargeAmount || rechargeAmount <= 0) {
      setError('请输入有效的充值金额');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // 从后端获取支付信息
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          amount: rechargeAmount,
          paymentMethod: 'alipay'
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '创建订单失败');
      }
      
      // 使用POST方式提交支付请求，与SDK的pagePay方法一致
      const form = document.createElement('form');
      form.id = 'dopay';
      form.method = 'POST';
      form.action = 'https://xnoo.cn/api/pay/submit';
      form.style.display = 'none'; // 隐藏表单
      
      // 添加支付参数
      Object.entries(data.params).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });
      
      // 添加提交按钮
      const submitBtn = document.createElement('input');
      submitBtn.type = 'submit';
      submitBtn.value = '正在跳转';
      form.appendChild(submitBtn);
      
      // 添加到文档并自动提交
      document.body.appendChild(form);
      
      // 添加自动提交脚本
      const script = document.createElement('script');
      script.text = "document.getElementById('dopay').submit();";
      document.body.appendChild(script);
      
      // 清理脚本
      setTimeout(() => {
        document.body.removeChild(script);
      }, 100);
      
      // 关闭充值弹窗
      setShowRechargeModal(false);
    } catch (error) {
      console.error('充值错误:', error);
      setError(error.message || '充值失败，请稍后再试');
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="user-info">
      <div className="user-name">
        <RiUser3Line className="user-icon" />
        <span>{user.name}</span>
      </div>
      
      <div className="user-credits">
        <RiCoinLine className="credits-icon" />
        <span>{user.credits} 积分</span>
        <button 
          className="recharge-button"
          onClick={() => setShowRechargeModal(true)}
          title="充值积分"
        >
          <RiAddCircleLine />
        </button>
      </div>
      
      <button className="logout-button" onClick={logout}>
        <RiLogoutBoxRLine className="logout-icon" />
        退出
      </button>
      
      {/* 充值弹窗 */}
      {showRechargeModal && (
        <div className="recharge-modal-overlay">
          <div className="recharge-modal">
            <h3>积分充值</h3>
            <p className="recharge-info">每充值1元获得10积分</p>
            <p className="recharge-info">当前还在测试阶段，请不要充值！！！</p>
            
            {error && <div className="recharge-error">{error}</div>}
            {success && <div className="recharge-success">{success}</div>}
            
            <form onSubmit={handleRecharge}>
              <div className="form-group">
                <label>充值金额（元）</label>
                <input
                  type="number"
                  min="1"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(parseInt(e.target.value) || 0)}
                  disabled={loading}
                />
              </div>
              
              <div className="recharge-buttons">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowRechargeModal(false)}
                  disabled={loading}
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className="confirm-button"
                  disabled={loading}
                >
                  {loading ? '处理中...' : '确认充值'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfo;
