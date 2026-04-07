import { useState } from 'react';

const WithdrawForm = ({ onSubmit, loading, minAmount }) => {
  const [form, setForm] = useState({
    amount: '',
    method: 'easypaisa',
    accountNumber: '',
    accountTitle: '',
    bankName: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Amount (Rs)</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder={`Minimum Rs ${minAmount}`}
          min={minAmount}
          required
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
        <div className="flex gap-3">
          {['easypaisa', 'jazzcash', 'bank'].map((m) => (
            <label key={m} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium
              ${form.method === m ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}>
              <input type="radio" name="method" value={m} checked={form.method === m} onChange={handleChange} className="sr-only" />
              {m === 'easypaisa' ? 'EasyPaisa' : m === 'jazzcash' ? 'JazzCash' : 'Bank'}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
        <input type="text" name="accountNumber" value={form.accountNumber} onChange={handleChange} placeholder="Enter account number" required className="input-field" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Account Title</label>
        <input type="text" name="accountTitle" value={form.accountTitle} onChange={handleChange} placeholder="Enter account holder name" required className="input-field" />
      </div>

      {form.method === 'bank' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name</label>
          <input type="text" name="bankName" value={form.bankName} onChange={handleChange} placeholder="Enter bank name" required className="input-field" />
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Submit Withdrawal Request'}
      </button>
    </form>
  );
};

export default WithdrawForm;
