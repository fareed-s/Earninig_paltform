import { useState, useEffect } from 'react';
import api from '../services/api';
import { HiUsers, HiCurrencyDollar, HiClock, HiClipboardList, HiCash, HiUserGroup } from 'react-icons/hi';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setData(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const stats = [
    { label: 'Total Users', value: data?.totalUsers || 0, icon: HiUsers, color: 'bg-blue-100 text-blue-600' },
    { label: 'Active Users', value: data?.activeUsers || 0, icon: HiUserGroup, color: 'bg-green-100 text-green-600' },
    { label: 'Pending Packages', value: data?.pendingPackageReqs || 0, icon: HiClock, color: 'bg-amber-100 text-amber-600' },
    { label: 'Pending Withdrawals', value: data?.pendingWithdrawReqs || 0, icon: HiCash, color: 'bg-red-100 text-red-600' },
    { label: 'Total Earnings Dist.', value: `Rs ${data?.totalEarningsDistributed || 0}`, icon: HiCurrencyDollar, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Total Withdrawals', value: `Rs ${data?.totalWithdrawals || 0}`, icon: HiCash, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Platform overview and statistics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Recent Users */}
      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-4">Recent Users</h2>
        {data?.recentUsers?.length > 0 ? (
          <div className="space-y-3">
            {data.recentUsers.map((u) => (
              <div key={u._id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="font-medium text-slate-700">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
                <span className={`badge ${u.package !== 'none' ? 'badge-success' : 'badge-warning'}`}>
                  {u.package !== 'none' ? u.package : 'No Package'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-4">No users yet</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
