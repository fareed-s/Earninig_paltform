import { useState, useEffect } from 'react';
import api from '../services/api';
import { HiCash, HiCurrencyDollar, HiUsers } from 'react-icons/hi';

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wallet').then(({ data }) => setWallet(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const typeLabels = { task_earning: 'Task Earning', referral_earning: 'Referral', withdraw_debit: 'Withdrawal', withdraw_refund: 'Refund' };
  const typeBadge = { task_earning: 'badge-success', referral_earning: 'badge-info', withdraw_debit: 'badge-danger', withdraw_refund: 'badge-warning' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Wallet</h1>
        <p className="text-slate-500 mt-1">Track your earnings and transactions</p>
      </div>

      {/* Balance Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
            <HiCash className="w-5 h-5" />
          </div>
          <p className="text-primary-100 text-sm">Current Balance</p>
          <p className="text-3xl font-bold mt-1">Rs {wallet?.walletBalance || 0}</p>
        </div>
        <div className="card">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
            <HiCurrencyDollar className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-sm text-slate-500">Total Earnings</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">Rs {wallet?.totalEarnings || 0}</p>
        </div>
        <div className="card">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
            <HiUsers className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-sm text-slate-500">Referral Earnings</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">Rs {wallet?.referralEarnings || 0}</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="card">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Transaction History</h2>
        {wallet?.transactions?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">Date</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">Type</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">Description</th>
                  <th className="text-right py-3 px-2 text-slate-500 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {wallet.transactions.map((tx) => (
                  <tr key={tx._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 px-2 text-slate-600 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`badge ${typeBadge[tx.type] || 'badge-info'}`}>{typeLabels[tx.type] || tx.type}</span>
                    </td>
                    <td className="py-3 px-2 text-slate-600 max-w-xs truncate">{tx.description}</td>
                    <td className={`py-3 px-2 text-right font-bold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {tx.amount >= 0 ? '+' : ''}Rs {Math.abs(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400 text-center py-8">No transactions yet</p>
        )}
      </div>
    </div>
  );
};

export default Wallet;
