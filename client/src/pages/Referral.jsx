import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiClipboardCopy, HiUsers, HiCurrencyDollar, HiExclamation } from 'react-icons/hi';

const Referral = () => {
  const { user } = useAuth();
  const [info, setInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [infoRes, statsRes] = await Promise.all([
        api.get('/referral'),
        api.get('/referral/stats'),
      ]);
      setInfo(infoRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const referralLink = `${window.location.origin}/register?ref=${info?.referralCode}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Referral Program</h1>
        <p className="text-slate-500 mt-1">Invite friends and earn commission</p>
      </div>

      {user?.package === 'none' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <HiExclamation className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700">You need an active package to earn referral commissions. You can still share your code!</p>
        </div>
      )}

      {/* Referral Code & Link */}
      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-4">Your Referral Details</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-50 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-400 mb-0.5">Referral Code</p>
              <p className="font-bold text-lg text-primary-600 font-mono">{info?.referralCode}</p>
            </div>
            <button onClick={() => copyToClipboard(info?.referralCode, 'Code')}
              className="p-3 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors">
              <HiClipboardCopy className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-50 rounded-xl px-4 py-3 overflow-hidden">
              <p className="text-xs text-slate-400 mb-0.5">Referral Link</p>
              <p className="text-sm text-slate-600 truncate">{referralLink}</p>
            </div>
            <button onClick={() => copyToClipboard(referralLink, 'Link')}
              className="p-3 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors">
              <HiClipboardCopy className="w-5 h-5" />
            </button>
          </div>
        </div>

        {user?.package !== 'none' && (
          <p className="text-sm text-slate-500 mt-3">
            Commission rate: <strong className="text-primary-600">{info?.referralCommissionPercent}%</strong> on every task your referrals complete
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
            <HiUsers className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-slate-500">Total Referred</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{stats?.totalReferred || 0}</p>
        </div>
        <div className="card">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
            <HiCurrencyDollar className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-sm text-slate-500">Total Referral Earnings</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">Rs {stats?.totalReferralEarnings || 0}</p>
        </div>
      </div>

      {/* Referred Users */}
      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-4">Your Referrals</h2>
        {stats?.referredUsers?.length > 0 ? (
          <div className="space-y-3">
            {stats.referredUsers.map((u) => (
              <div key={u._id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="font-medium text-slate-700">{u.name}</p>
                  <p className="text-xs text-slate-400">Joined {new Date(u.createdAt).toLocaleDateString('en-PK')}</p>
                </div>
                <span className={`badge ${u.package !== 'none' ? 'badge-success' : 'badge-warning'}`}>
                  {u.package !== 'none' ? u.package.charAt(0).toUpperCase() + u.package.slice(1) : 'No Package'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-6">No referrals yet. Share your link to start earning!</p>
        )}
      </div>
    </div>
  );
};

export default Referral;
