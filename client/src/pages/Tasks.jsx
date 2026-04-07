import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import toast from 'react-hot-toast';

const Tasks = () => {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ tasks: [], tasksCompletedToday: 0, dailyTaskLimit: 0, earningMultiplier: 0, hasPackage: false });
  const [completedIds, setCompletedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const [tasksRes, completedRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/tasks/completed'),
      ]);
      setData(tasksRes.data);
      setCompletedIds(completedRes.data.completedTaskIds || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (taskId) => {
    setCompletingId(taskId);
    try {
      const { data: result } = await api.post(`/tasks/complete/${taskId}`);
      toast.success(result.message);
      setCompletedIds((prev) => [...prev, taskId]);
      setData((prev) => ({ ...prev, tasksCompletedToday: result.tasksCompletedToday }));
      await refreshUser();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete task';
      if (err.response?.data?.needsPackage) {
        toast.error(msg);
        navigate('/packages');
      } else {
        toast.error(msg);
      }
    } finally {
      setCompletingId(null);
    }
  };

  const limitReached = data.tasksCompletedToday >= data.dailyTaskLimit && data.dailyTaskLimit > 0;
  const progressPercent = data.dailyTaskLimit > 0 ? Math.min((data.tasksCompletedToday / data.dailyTaskLimit) * 100, 100) : 0;

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
        <h1 className="text-2xl font-bold text-slate-800">Available Tasks</h1>
        <p className="text-slate-500 mt-1">Complete tasks to earn money</p>
      </div>

      {/* Progress Bar */}
      {data.hasPackage && (
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Daily Progress</span>
            <span className="text-sm font-bold text-primary-600">
              {data.tasksCompletedToday}/{data.dailyTaskLimit >= 999 ? '∞' : data.dailyTaskLimit} tasks
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500" style={{ width: `${data.dailyTaskLimit >= 999 ? Math.min(data.tasksCompletedToday * 5, 100) : progressPercent}%` }} />
          </div>
          {limitReached && data.dailyTaskLimit < 999 && (
            <p className="text-sm text-amber-600 font-medium mt-2">Daily limit reached! Come back tomorrow 🌅</p>
          )}
        </div>
      )}

      {/* Tasks Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            multiplier={data.earningMultiplier}
            hasPackage={data.hasPackage}
            isCompleted={completedIds.includes(task._id)}
            onComplete={handleComplete}
            completing={completingId === task._id}
          />
        ))}
      </div>

      {data.tasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-slate-300 mb-2">📋</p>
          <p className="text-slate-400">No tasks available right now</p>
        </div>
      )}
    </div>
  );
};

export default Tasks;
