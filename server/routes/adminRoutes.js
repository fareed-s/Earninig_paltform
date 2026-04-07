const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const {
  getDashboard, getUsers,
  getPackageRequests, approvePackageRequest, rejectPackageRequest,
  getWithdrawRequests, markWithdrawPaid, rejectWithdraw,
  getAllTasks, createTask, updateTask, deleteTask,
  getSettings, updateSettings,
} = require('../controllers/adminController');

// All admin routes require auth + admin role
router.use(protect, admin);

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);

router.get('/package-requests', getPackageRequests);
router.patch('/package-requests/:id/approve', approvePackageRequest);
router.patch('/package-requests/:id/reject', rejectPackageRequest);

router.get('/withdraw-requests', getWithdrawRequests);
router.patch('/withdraw-requests/:id/paid', markWithdrawPaid);
router.patch('/withdraw-requests/:id/reject', rejectWithdraw);

router.get('/tasks', getAllTasks);
router.post('/tasks', createTask);
router.patch('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

router.get('/settings', getSettings);
router.patch('/settings', updateSettings);

module.exports = router;
