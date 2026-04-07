import { HiPlay, HiCursorClick, HiClipboardList, HiShare, HiCheck, HiClock } from 'react-icons/hi';

const typeIcons = {
  video: HiPlay,
  click: HiCursorClick,
  survey: HiClipboardList,
  social: HiShare,
};

const typeColors = {
  video: 'bg-red-100 text-red-600',
  click: 'bg-blue-100 text-blue-600',
  survey: 'bg-purple-100 text-purple-600',
  social: 'bg-emerald-100 text-emerald-600',
};

const TaskCard = ({ task, multiplier, hasPackage, isCompleted, onComplete, completing }) => {
  const Icon = typeIcons[task.type] || HiClipboardList;
  const colorClass = typeColors[task.type] || 'bg-slate-100 text-slate-600';
  const userReward = task.reward * (multiplier || 1);

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="badge badge-info capitalize">{task.type}</span>
      </div>

      <h3 className="font-semibold text-slate-800 mb-1">{task.title}</h3>
      <p className="text-sm text-slate-500 mb-4 flex-1">{task.description}</p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 text-sm text-slate-500">
          <HiClock className="w-4 h-4" />
          <span>{task.duration}s</span>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-primary-600">Rs {userReward}</span>
          {multiplier > 1 && (
            <span className="text-xs text-slate-400 ml-1 line-through">Rs {task.reward}</span>
          )}
        </div>
      </div>

      {isCompleted ? (
        <button disabled className="w-full py-2.5 rounded-xl bg-green-50 text-green-600 font-semibold flex items-center justify-center gap-2">
          <HiCheck className="w-4 h-4" /> Completed
        </button>
      ) : !hasPackage ? (
        <button disabled className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 font-semibold text-sm">
          Buy a package to earn
        </button>
      ) : (
        <button
          onClick={() => onComplete(task._id)}
          disabled={completing}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {completing ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>Complete Task</>
          )}
        </button>
      )}
    </div>
  );
};

export default TaskCard;
