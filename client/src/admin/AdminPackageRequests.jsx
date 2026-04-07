import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiCheck, HiX, HiPhotograph } from 'react-icons/hi';

const AdminPackageRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/package-requests?status=${filter}`);
      setRequests(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await api.patch(`/admin/package-requests/${id}/approve`, { note: 'Approved' });
      toast.success('Package approved');
      fetchRequests();
    } catch (err) { toast.error('Failed to approve'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id) => {
    const note = prompt('Rejection reason (optional):');
    if (note === null) return;
    setActionLoading(id);
    try {
      await api.patch(`/admin/package-requests/${id}/reject`, { note: note || 'Rejected' });
      toast.success('Package rejected');
      fetchRequests();
    } catch (err) { toast.error('Failed to reject'); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Package Requests</h1>
        <p className="text-slate-500 mt-1">Review and manage package purchase requests</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', 'all'].map((f) => (
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
                <th className="text-left py-3 px-3 text-slate-500 font-medium">Package</th>
                <th className="text-right py-3 px-3 text-slate-500 font-medium">Amount</th>
                <th className="text-left py-3 px-3 text-slate-500 font-medium">Method</th>
                <th className="text-left py-3 px-3 text-slate-500 font-medium">TXN ID</th>
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
                    <p className="text-xs text-slate-400">{r.userId?.email}</p>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700">{r.packageName}</td>
                  <td className="py-3 px-3 text-right">Rs {r.amount}</td>
                  <td className="py-3 px-3 capitalize">{r.paymentMethod}</td>
                  <td className="py-3 px-3 font-mono text-xs">{r.transactionId}</td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString('en-PK')}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`badge ${r.status === 'pending' ? 'badge-warning' : r.status === 'approved' ? 'badge-success' : 'badge-danger'}`}>{r.status}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setPreviewImg(r.screenshotUrl)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500" title="View Screenshot">
                        <HiPhotograph className="w-4 h-4" />
                      </button>
                      {r.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(r._id)} disabled={actionLoading === r._id}
                            className="p-2 rounded-lg hover:bg-green-50 text-green-600" title="Approve">
                            <HiCheck className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleReject(r._id)} disabled={actionLoading === r._id}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-500" title="Reject">
                            <HiX className="w-4 h-4" />
                          </button>
                        </>
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

      {/* Image Preview Modal */}
      {previewImg && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setPreviewImg(null)}>
          <div className="relative max-w-2xl max-h-[80vh]">
            <button onClick={() => setPreviewImg(null)} className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
              <HiX className="w-4 h-4" />
            </button>
            <img src={previewImg} alt="Screenshot" className="rounded-xl max-h-[80vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPackageRequests;
