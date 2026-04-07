const User = require('../models/User');
const Task = require('../models/Task');
const Package = require('../models/Package');
const PackageRequest = require('../models/PackageRequest');
const WithdrawRequest = require('../models/WithdrawRequest');
const Transaction = require('../models/Transaction');
const Settings = require('../models/Settings');

// GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', package: { $ne: 'none' } });
    const pendingPackageReqs = await PackageRequest.countDocuments({ status: 'pending' });
    const pendingWithdrawReqs = await WithdrawRequest.countDocuments({ status: 'pending' });
    const totalTasks = await Task.countDocuments();

    const earningsAgg = await Transaction.aggregate([
      { $match: { type: 'task_earning' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalEarningsDistributed = earningsAgg.length > 0 ? earningsAgg[0].total : 0;

    const withdrawAgg = await WithdrawRequest.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalWithdrawals = withdrawAgg.length > 0 ? withdrawAgg[0].total : 0;

    const recentUsers = await User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('name email package createdAt');

    res.json({
      totalUsers,
      activeUsers,
      pendingPackageReqs,
      pendingWithdrawReqs,
      totalTasks,
      totalEarningsDistributed,
      totalWithdrawals,
      recentUsers,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/package-requests
const getPackageRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const requests = await PackageRequest.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/admin/package-requests/:id/approve
const approvePackageRequest = async (req, res) => {
  try {
    const request = await PackageRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    const pkg = await Package.findOne({ slug: request.packageSlug });
    if (!pkg) return res.status(404).json({ message: 'Package not found' });

    // Activate package for user
    const user = await User.findById(request.userId);
    user.package = pkg.slug;
    user.earningMultiplier = pkg.earningMultiplier;
    user.dailyTaskLimit = pkg.dailyTaskLimit;
    user.referralCommissionPercent = pkg.referralCommissionPercent;
    user.packageActivatedAt = new Date();
    await user.save();

    // Update request
    request.status = 'approved';
    request.adminNote = req.body.note || 'Approved';
    request.reviewedAt = new Date();
    await request.save();

    res.json({ message: 'Package request approved', request });
  } catch (error) {
    console.error('Approve package error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/admin/package-requests/:id/reject
const rejectPackageRequest = async (req, res) => {
  try {
    const request = await PackageRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    request.status = 'rejected';
    request.adminNote = req.body.note || 'Rejected';
    request.reviewedAt = new Date();
    await request.save();

    res.json({ message: 'Package request rejected', request });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/withdraw-requests
const getWithdrawRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const requests = await WithdrawRequest.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/admin/withdraw-requests/:id/paid
const markWithdrawPaid = async (req, res) => {
  try {
    const request = await WithdrawRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    request.status = 'paid';
    request.adminNote = req.body.note || 'Payment sent';
    request.paidAt = new Date();
    await request.save();

    res.json({ message: 'Withdrawal marked as paid', request });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/admin/withdraw-requests/:id/reject
const rejectWithdraw = async (req, res) => {
  try {
    const request = await WithdrawRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    // Refund balance to user
    const user = await User.findById(request.userId);
    user.walletBalance += request.amount;
    await user.save();

    // Create refund transaction
    await Transaction.create({
      userId: user._id,
      amount: request.amount,
      type: 'withdraw_refund',
      description: `Withdrawal refund of Rs ${request.amount} - rejected by admin`,
    });

    request.status = 'rejected';
    request.adminNote = req.body.note || 'Rejected';
    await request.save();

    res.json({ message: 'Withdrawal rejected, balance refunded', request });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// --- Task CRUD ---
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, reward, type, duration, isActive } = req.body;
    if (!title || !description || !reward || !type || !duration) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const task = await Task.create({ title, description, reward, type, duration, isActive: isActive !== false });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// --- Settings ---
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});

    const fields = ['easypaisaNumber', 'easypaisaName', 'jazzcashNumber', 'jazzcashName',
      'adminWhatsapp', 'minimumWithdraw', 'platformName', 'isMaintenanceMode'];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) settings[field] = req.body[field];
    });

    await settings.save();
    res.json({ message: 'Settings updated', settings });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboard, getUsers,
  getPackageRequests, approvePackageRequest, rejectPackageRequest,
  getWithdrawRequests, markWithdrawPaid, rejectWithdraw,
  getAllTasks, createTask, updateTask, deleteTask,
  getSettings, updateSettings,
};
