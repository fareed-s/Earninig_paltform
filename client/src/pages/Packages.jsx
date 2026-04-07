import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PackageCard from '../components/PackageCard';
import toast from 'react-hot-toast';
import { HiX, HiUpload, HiCheckCircle, HiClock } from 'react-icons/hi';

const Packages = () => {
  const { user, refreshUser } = useAuth();
  const [packages, setPackages] = useState([]);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [myRequest, setMyRequest] = useState(null);
  const [form, setForm] = useState({ transactionId: '', paymentMethod: 'easypaisa', screenshot: null });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pkgRes, payRes, reqRes] = await Promise.all([
        api.get('/packages'),
        api.get('/settings/payment-info'),
        api.get('/packages/my-request'),
      ]);
      setPackages(pkgRes.data);
      setPaymentInfo(payRes.data);
      setMyRequest(reqRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = (pkg) => {
    if (myRequest?.status === 'pending') {
      toast.error('You already have a pending package request');
      return;
    }
    setSelectedPkg(pkg);
    setForm({ transactionId: '', paymentMethod: 'easypaisa', screenshot: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.screenshot) { toast.error('Please upload payment screenshot'); return; }
    if (!form.transactionId.trim()) { toast.error('Transaction ID is required'); return; }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('packageSlug', selectedPkg.slug);
      formData.append('transactionId', form.transactionId);
      formData.append('paymentMethod', form.paymentMethod);
      formData.append('screenshot', form.screenshot);

      await api.post('/packages/request', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Package request submitted! Waiting for admin approval.');
      setSelectedPkg(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Choose Your Package</h1>
        <p className="text-slate-500 mt-1">Select a package to start earning</p>
      </div>

      {/* Pending Request Banner */}
      {myRequest?.status === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <HiClock className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-800">Package Request Pending</p>
            <p className="text-sm text-amber-600">Your {myRequest.packageName} package request is being reviewed by admin</p>
          </div>
        </div>
      )}
      {myRequest?.status === 'rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="font-semibold text-red-800">Previous Request Rejected</p>
          <p className="text-sm text-red-600">Reason: {myRequest.adminNote || 'No reason given'}. You can submit a new request.</p>
        </div>
      )}

      {/* Package Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg._id}
            pkg={pkg}
            currentPackage={user?.package}
            onBuy={handleBuy}
            recommended={pkg.slug === 'standard'}
          />
        ))}
      </div>

      {/* Purchase Modal */}
      {selectedPkg && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedPkg(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Buy {selectedPkg.name} Package</h2>
              <button onClick={() => setSelectedPkg(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><HiX className="w-5 h-5" /></button>
            </div>

            <div className="p-5 space-y-5">
              {/* Payment Info */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-slate-700">Send Rs {selectedPkg.price} to:</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">EasyPaisa:</span>
                    <span className="font-medium text-slate-700">{paymentInfo?.easypaisaNumber} — {paymentInfo?.easypaisaName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">JazzCash:</span>
                    <span className="font-medium text-slate-700">{paymentInfo?.jazzcashNumber} — {paymentInfo?.jazzcashName}</span>
                  </div>
                </div>
                {paymentInfo?.adminWhatsapp && (
                  <p className="text-xs text-slate-500">Or send proof on WhatsApp: <strong>{paymentInfo.adminWhatsapp}</strong></p>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Transaction ID</label>
                  <input type="text" value={form.transactionId} onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
                    placeholder="Enter your transaction ID" required className="input-field" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                  <div className="flex gap-3">
                    {['easypaisa', 'jazzcash'].map((m) => (
                      <label key={m} className={`flex-1 text-center py-2.5 rounded-xl border-2 cursor-pointer text-sm font-medium transition-all
                        ${form.paymentMethod === m ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                        <input type="radio" value={m} checked={form.paymentMethod === m}
                          onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="sr-only" />
                        {m === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payment Screenshot</label>
                  <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors
                    ${form.screenshot ? 'border-green-400 bg-green-50' : 'border-slate-300 hover:border-primary-400'}`}>
                    {form.screenshot ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <HiCheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{form.screenshot.name}</span>
                      </div>
                    ) : (
                      <>
                        <HiUpload className="w-8 h-8 text-slate-400 mb-2" />
                        <span className="text-sm text-slate-500">Click to upload screenshot</span>
                        <span className="text-xs text-slate-400 mt-1">JPG, PNG — Max 5MB</span>
                      </>
                    )}
                    <input type="file" accept="image/jpeg,image/jpg,image/png" className="sr-only"
                      onChange={(e) => setForm({ ...form, screenshot: e.target.files[0] })} />
                  </label>
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center">
                  {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Submit Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Packages;
