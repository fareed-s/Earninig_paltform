import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { HiCurrencyDollar, HiUsers, HiClipboardList, HiCash, HiExclamation, HiArrowRight } from 'react-icons/hi';

const Dashboard = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const { data } = await api.get('/wallet');
      setWallet(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Earnings', value: `Rs ${wallet?.totalEarnings || 0}`, icon: HiCurrencyDollar, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Referral Earnings', value: `Rs ${wallet?.referralEarnings || 0}`, icon: HiUsers, color: 'bg-purple-100 text-purple-600' },
    { label: 'Current Balance', value: `Rs ${wallet?.walletBalance || 0}`, icon: HiCash, color: 'bg-blue-100 text-blue-600' },
    { label: 'Tasks Today', value: user?.tasksCompletedToday || 0, icon: HiClipboardList, color: 'bg-amber-100 text-amber-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-slate-500 mt-1">Here's your earnings overview</p>
      </div>

      {/* Package Warning */}
      {user?.package === 'none' && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <HiExclamation className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-800">No Active Package</p>
              <p className="text-sm text-amber-600">Buy a package to start earning from tasks and referrals</p>
            </div>
          </div>
          <Link to="/packages" className="btn-primary flex items-center gap-2 whitespace-nowrap">
            Buy Package <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Active Package Badge */}
      {user?.package !== 'none' && (
        <div className="bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
            <span className="text-xl">🎖️</span>
          </div>
          <div>
            <p className="font-semibold text-primary-800">{user.package.charAt(0).toUpperCase() + user.package.slice(1)} Package Active</p>
            <p className="text-sm text-primary-600">{user.earningMultiplier}x multiplier • {user.dailyTaskLimit >= 999 ? 'Unlimited' : user.dailyTaskLimit} tasks/day • {user.referralCommissionPercent}% referral commission</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Browse Tasks', to: '/tasks', emoji: '📋' },
          { label: 'View Packages', to: '/packages', emoji: '💎' },
          { label: 'My Referrals', to: '/referral', emoji: '👥' },
          { label: 'Withdraw', to: '/withdraw', emoji: '💸' },
        ].map((action, i) => (
          <Link key={i} to={action.to} className="card hover:shadow-md transition-all duration-200 text-center group">
            <span className="text-2xl block mb-2">{action.emoji}</span>
            <span className="text-sm font-medium text-slate-600 group-hover:text-primary-600">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Transactions</h2>
        {wallet?.transactions?.length > 0 ? (
          <div className="space-y-3">
            {wallet.transactions.slice(0, 5).map((tx) => (
              <div key={tx._id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-700">{tx.description}</p>
                  <p className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <span className={`text-sm font-bold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.amount >= 0 ? '+' : ''}Rs {Math.abs(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-6">No transactions yet</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
