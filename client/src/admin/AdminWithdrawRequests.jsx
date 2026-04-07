import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiCheck, HiX } from 'react-icons/hi';

const AdminWithdrawRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/withdraw-requests?status=${filter}`);
      setRequests(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handlePaid = async (id) => {
    const note = prompt('Payment note (optional):');
    if (note === null) return;
    setActionLoading(id);
    try {
      await api.patch(`/admin/withdraw-requests/${id}/paid`, { note: note || 'Payment sent' });
      toast.success('Marked as paid');
      fetchRequests();
    } catch (err) { toast.error('Failed'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id) => {
    const note = prompt('Rejection reason:');
    if (note === null) return;
    setActionLoading(id);
    try {
      await api.patch(`/admin/withdraw-requests/${id}/reject`, { note: note || 'Rejected' });
      toast.success('Withdrawal rejected, balance refunded');
      fetchRequests();
    } catch (err) { toast.error('Failed'); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Withdrawal Requests</h1>
        <p className="text-slate-500 mt-1">Process user withdrawal requests</p>
      </div>

      <div className="flex gap-2">
        {['pending', 'paid', 'rejected', 'all'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-3 text-slate-500 font-medium">User</th>
                <th className="text-right py-3 px-3 text-slate-500 font-medium">Amount</th>
                <th className="text-left py-3 px-3 text-slate-500 font-medium">Method</th>
                <th className="text-left py-3 px-3 text-slate-500 font-medium">Account</th>
                <th className="text-left py-3 px-3 text-slate-500 font-medium">Date</th>
                <th className="text-center py-3 px-3 text-slate-500 font-medium">Status</th>
                <th className="text-right py-3 px-3 text-slate-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-3 px-3">
                    <p className="font-medium text-slate-700">{r.userId?.name}</p>
                    <p className="text-xs text-slate-400">{r.userId?.phone}</p>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-800">Rs {r.amount}</td>
                  <td className="py-3 px-3 capitalize">{r.method}</td>
                  <td className="py-3 px-3">
                    <p className="text-slate-700">{r.accountTitle}</p>
                    <p className="text-xs text-slate-400 font-mono">{r.accountNumber}</p>
                    {r.bankName && <p className="text-xs text-slate-400">{r.bankName}</p>}
                  </td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString('en-PK')}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`badge ${r.status === 'pending' ? 'badge-warning' : r.status === 'paid' ? 'badge-success' : 'badge-danger'}`}>{r.status}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-end gap-1">
                      {r.status === 'pending' && (
                        <>
                          <button onClick={() => handlePaid(r._id)} disabled={actionLoading === r._id}
                            className="p-2 rounded-lg hover:bg-green-50 text-green-600" title="Mark as Paid">
                            <HiCheck className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleReject(r._id)} disabled={actionLoading === r._id}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-500" title="Reject">
                            <HiX className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {r.adminNote && (
                        <span className="text-xs text-slate-400 ml-2" title={r.adminNote}>📝</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {requests.length === 0 && <p className="text-center text-slate-400 py-8">No requests found</p>}
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawRequests;
