const Task = require('../models/Task');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Helper: check if date is today
const isToday = (date) => {
  if (!date) return false;
  const today = new Date();
  const d = new Date(date);
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
};

// GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ isActive: true }).sort({ createdAt: -1 });

    // Reset daily count if lastTaskDate is not today
    const user = req.user;
    let tasksCompletedToday = user.tasksCompletedToday;
    if (!isToday(user.lastTaskDate)) {
      tasksCompletedToday = 0;
    }

    res.json({
      tasks,
      tasksCompletedToday,
      dailyTaskLimit: user.dailyTaskLimit,
      earningMultiplier: user.earningMultiplier,
      hasPackage: user.package !== 'none',
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/tasks/complete/:taskId
const completeTask = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Check if user has a package
    if (user.package === 'none') {
      return res.status(403).json({ message: 'Please buy a package to start earning', needsPackage: true });
    }

    // Reset daily count if new day
    if (!isToday(user.lastTaskDate)) {
      user.tasksCompletedToday = 0;
      user.completedTaskIds = [];
    }

    // Check daily limit
    if (user.tasksCompletedToday >= user.dailyTaskLimit) {
      return res.status(403).json({ message: 'Daily task limit reached. Come back tomorrow!' });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task || !task.isActive) {
      return res.status(404).json({ message: 'Task not found or inactive' });
    }

    // Check if already completed today
    if (user.completedTaskIds.includes(task._id)) {
      return res.status(400).json({ message: 'Task already completed today' });
    }

    // Calculate earning
    const earning = task.reward * user.earningMultiplier;

    // Update user
    user.walletBalance += earning;
    user.totalEarnings += earning;
    user.tasksCompletedToday += 1;
    user.lastTaskDate = new Date();
    user.completedTaskIds.push(task._id);
    await user.save();

    // Create transaction
    await Transaction.create({
      userId: user._id,
      amount: earning,
      type: 'task_earning',
      description: `Earned Rs ${earning} from task: ${task.title}`,
    });

    // Handle referral commission
    if (user.referredBy) {
      const referrer = await User.findOne({ referralCode: user.referredBy });
      if (referrer && referrer.package !== 'none') {
        const commission = earning * (referrer.referralCommissionPercent / 100);
        if (commission > 0) {
          referrer.walletBalance += commission;
          referrer.totalEarnings += commission;
          referrer.referralEarnings += commission;
          await referrer.save();

          await Transaction.create({
            userId: referrer._id,
            amount: commission,
            type: 'referral_earning',
            description: `Referral commission Rs ${commission} from ${user.name}`,
          });
        }
      }
    }

    res.json({
      message: `Task completed! Earned Rs ${earning}`,
      earning,
      newBalance: user.walletBalance,
      tasksCompletedToday: user.tasksCompletedToday,
    });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/tasks/completed
const getCompletedTasks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let completedIds = [];
    if (isToday(user.lastTaskDate)) {
      completedIds = user.completedTaskIds;
    }
    res.json({ completedTaskIds: completedIds, tasksCompletedToday: isToday(user.lastTaskDate) ? user.tasksCompletedToday : 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getTasks, completeTask, getCompletedTasks };
