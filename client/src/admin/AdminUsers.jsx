import { useState, useEffect } from 'react';
import api from '../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/users').then(({ data }) => setUsers(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Users</h1>
          <p className="text-slate-500 mt-1">{users.length} total users</p>
        </div>
        <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field max-w-xs" />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-3 px-3 text-slate-500 font-medium">Name</th>
              <th className="text-left py-3 px-3 text-slate-500 font-medium">Email</th>
              <th className="text-left py-3 px-3 text-slate-500 font-medium">Phone</th>
              <th className="text-left py-3 px-3 text-slate-500 font-medium">Package</th>
              <th className="text-right py-3 px-3 text-slate-500 font-medium">Balance</th>
              <th className="text-right py-3 px-3 text-slate-500 font-medium">Earnings</th>
              <th className="text-left py-3 px-3 text-slate-500 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="py-3 px-3 font-medium text-slate-700">{u.name}</td>
                <td className="py-3 px-3 text-slate-600">{u.email}</td>
                <td className="py-3 px-3 text-slate-600">{u.phone}</td>
                <td className="py-3 px-3">
                  <span className={`badge ${u.package !== 'none' ? 'badge-success' : 'badge-warning'}`}>
                    {u.package !== 'none' ? u.package : 'None'}
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-medium">Rs {u.walletBalance}</td>
                <td className="py-3 px-3 text-right font-medium">Rs {u.totalEarnings}</td>
                <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString('en-PK')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-slate-400 py-6">No users found</p>}
      </div>
    </div>
  );
};

export default AdminUsers;
