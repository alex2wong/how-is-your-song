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
      
      const response = await fetchApi('api/credits/recharge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ amount: rechargeAmount }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(`充值成功！获得 ${rechargeAmount * 10} 积分`);
        setTimeout(() => {
          setShowRechargeModal(false);
          setSuccess('');
          // 刷新页面以更新用户积分显示
          window.location.reload();
        }, 2000);
      } else {
        setError(data.message || '充值失败');
      }
    } catch (error) {
      console.error('充值错误:', error);
      setError('充值失败，请稍后再试');
    } finally {
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
