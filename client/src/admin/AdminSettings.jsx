import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [form, setForm] = useState({
    easypaisaNumber: '',
    easypaisaName: '',
    jazzcashNumber: '',
    jazzcashName: '',
    adminWhatsapp: '',
    minimumWithdraw: 500,
    platformName: '',
    isMaintenanceMode: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/settings')
      .then(({ data }) => {
        setForm({
          easypaisaNumber: data.easypaisaNumber || '',
          easypaisaName: data.easypaisaName || '',
          jazzcashNumber: data.jazzcashNumber || '',
          jazzcashName: data.jazzcashName || '',
          adminWhatsapp: data.adminWhatsapp || '',
          minimumWithdraw: data.minimumWithdraw || 500,
          platformName: data.platformName || '',
          isMaintenanceMode: data.isMaintenanceMode || false,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/admin/settings', {
        ...form,
        minimumWithdraw: Number(form.minimumWithdraw),
      });
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
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
        <h1 className="text-2xl font-bold text-slate-800">Platform Settings</h1>
        <p className="text-slate-500 mt-1">Configure payment accounts and platform options</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Platform Info */}
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">General</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Platform Name</label>
              <input type="text" name="platformName" value={form.platformName} onChange={handleChange} className="input-field max-w-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Withdrawal Amount (Rs)</label>
              <input type="number" name="minimumWithdraw" value={form.minimumWithdraw} onChange={handleChange} className="input-field max-w-xs" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="isMaintenanceMode" checked={form.isMaintenanceMode} onChange={handleChange}
                className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
              <div>
                <span className="text-sm font-medium text-slate-700">Maintenance Mode</span>
                <p className="text-xs text-slate-400">When enabled, users will see a maintenance message</p>
              </div>
            </label>
          </div>
        </div>

        {/* EasyPaisa Settings */}
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">EasyPaisa Account</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
              <input type="text" name="easypaisaNumber" value={form.easypaisaNumber} onChange={handleChange} placeholder="03001234567" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
              <input type="text" name="easypaisaName" value={form.easypaisaName} onChange={handleChange} placeholder="Account holder name" className="input-field" />
            </div>
          </div>
        </div>

        {/* JazzCash Settings */}
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">JazzCash Account</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
              <input type="text" name="jazzcashNumber" value={form.jazzcashNumber} onChange={handleChange} placeholder="03001234567" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
              <input type="text" name="jazzcashName" value={form.jazzcashName} onChange={handleChange} placeholder="Account holder name" className="input-field" />
            </div>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">Contact</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Admin WhatsApp Number</label>
            <input type="text" name="adminWhatsapp" value={form.adminWhatsapp} onChange={handleChange} placeholder="03001234567" className="input-field max-w-md" />
            <p className="text-xs text-slate-400 mt-1">Users will see this number for payment proof submission</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary px-8 flex items-center justify-center gap-2">
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
