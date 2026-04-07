import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiPlus, HiPencil, HiTrash, HiX } from 'react-icons/hi';

const emptyForm = { title: '', description: '', reward: '', type: 'video', duration: '', isActive: true };

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/admin/tasks');
      setTasks(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditId(null); setForm(emptyForm); setModal(true); };
  const openEdit = (task) => {
    setEditId(task._id);
    setForm({ title: task.title, description: task.description, reward: task.reward, type: task.type, duration: task.duration, isActive: task.isActive });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, reward: Number(form.reward), duration: Number(form.duration) };
      if (editId) {
        await api.patch(`/admin/tasks/${editId}`, payload);
        toast.success('Task updated');
      } else {
        await api.post('/admin/tasks', payload);
        toast.success('Task created');
      }
      setModal(false);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/admin/tasks/${id}`);
      toast.success('Task deleted');
      fetchTasks();
    } catch (err) { toast.error('Failed to delete'); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Task Management</h1>
          <p className="text-slate-500 mt-1">{tasks.length} tasks</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <HiPlus className="w-4 h-4" /> Add Task
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-3 px-3 text-slate-500 font-medium">Title</th>
              <th className="text-left py-3 px-3 text-slate-500 font-medium">Type</th>
              <th className="text-right py-3 px-3 text-slate-500 font-medium">Reward</th>
              <th className="text-right py-3 px-3 text-slate-500 font-medium">Duration</th>
              <th className="text-center py-3 px-3 text-slate-500 font-medium">Status</th>
              <th className="text-right py-3 px-3 text-slate-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="py-3 px-3 font-medium text-slate-700">{t.title}</td>
                <td className="py-3 px-3"><span className="badge badge-info capitalize">{t.type}</span></td>
                <td className="py-3 px-3 text-right">Rs {t.reward}</td>
                <td className="py-3 px-3 text-right">{t.duration}s</td>
                <td className="py-3 px-3 text-center">
                  <span className={`badge ${t.isActive ? 'badge-success' : 'badge-danger'}`}>{t.isActive ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(t)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"><HiPencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(t._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><HiTrash className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">{editId ? 'Edit Task' : 'Create Task'}</h2>
              <button onClick={() => setModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><HiX className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required className="input-field" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Base Reward (Rs)</label>
                  <input type="number" value={form.reward} onChange={(e) => setForm({ ...form, reward: e.target.value })} required className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duration (sec)</label>
                  <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                  <option value="video">Video</option>
                  <option value="click">Click</option>
                  <option value="survey">Survey</option>
                  <option value="social">Social</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-slate-700">Active</span>
              </label>
              <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center">
                {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (editId ? 'Update Task' : 'Create Task')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTasks;
