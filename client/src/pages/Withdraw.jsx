import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import WithdrawForm from '../components/WithdrawForm';
import toast from 'react-hot-toast';
import { HiCash, HiClock, HiCheckCircle, HiXCircle, HiExclamation } from 'react-icons/hi';

const Withdraw = () => {
  const { user, refreshUser } = useAuth();
  const [pending, setPending] = useState(null);
  const [history, setHistory] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendRes, histRes, setRes] = await Promise.all([
        api.get('/withdraw/pending'),
        api.get('/withdraw/history'),
        api.get('/settings/payment-info'),
      ]);
      setPending(pendRes.data);
      setHistory(histRes.data);
      setSettings(setRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (form) => {
    setSubmitting(true);
    try {
      await api.post('/withdraw/request', form);
      toast.success('Withdrawal request submitted!');
      await refreshUser();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const statusIcon = { pending: HiClock, paid: HiCheckCircle, rejected: HiXCircle };
  const statusColor = { pending: 'text-amber-500', paid: 'text-green-500', rejected: 'text-red-500' };
  const statusBadge = { pending: 'badge-warning', paid: 'badge-success', rejected: 'badge-danger' };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const minWithdraw = settings?.minimumWithdraw || 500;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Withdraw Funds</h1>
        <p className="text-slate-500 mt-1">Request withdrawal of your earnings</p>
      </div>

      {/* Balance Card */}
      <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="flex items-center gap-3 mb-1">
          <HiCash className="w-6 h-6" />
          <span className="text-primary-100 text-sm">Available Balance</span>
        </div>
        <p className="text-3xl font-bold">Rs {user?.walletBalance || 0}</p>
        <p className="text-primary-200 text-sm mt-1">Minimum withdrawal: Rs {minWithdraw}</p>
      </div>

      {/* No Package Warning */}
      {user?.package === 'none' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <HiExclamation className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-800">Active package required</p>
            <p className="text-sm text-amber-600">
              You need an active package to withdraw. <Link to="/packages" className="underline font-medium">Buy one here</Link>
            </p>
          </div>
        </div>
      )}

      {/* Pending Request */}
      {pending?.hasPending && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <HiClock className="w-5 h-5 text-amber-500" />
            <p className="font-semibold text-amber-800">Pending Withdrawal</p>
          </div>
          <p className="text-sm text-amber-600">
            Rs {pending.request.amount} via {pending.request.method} — submitted on{' '}
            {new Date(pending.request.createdAt).toLocaleDateString('en-PK')}
          </p>
        </div>
      )}

      {/* Withdraw Form */}
      {user?.package !== 'none' && !pending?.hasPending && user?.walletBalance >= minWithdraw && (
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">Request Withdrawal</h2>
          <WithdrawForm onSubmit={handleSubmit} loading={submitting} minAmount={minWithdraw} />
        </div>
      )}

      {user?.package !== 'none' && !pending?.hasPending && user?.walletBalance < minWithdraw && (
        <div className="card text-center py-8">
          <p className="text-slate-400">Insufficient balance for withdrawal. Keep completing tasks!</p>
        </div>
      )}

      {/* History */}
      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-4">Withdrawal History</h2>
        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((w) => {
              const Icon = statusIcon[w.status];
              return (
                <div key={w._id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${statusColor[w.status]}`} />
                    <div>
                      <p className="font-medium text-slate-700">Rs {w.amount}</p>
                      <p className="text-xs text-slate-400">{w.method} • {w.accountNumber} • {new Date(w.createdAt).toLocaleDateString('en-PK')}</p>
                      {w.adminNote && <p className="text-xs text-slate-500 mt-0.5">Note: {w.adminNote}</p>}
                    </div>
                  </div>
                  <span className={`badge ${statusBadge[w.status]}`}>{w.status}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-6">No withdrawal history</p>
        )}
      </div>
    </div>
  );
};

export default Withdraw;
