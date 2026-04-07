const express = require('express');
const router = express.Router();
const { getTasks, completeTask, getCompletedTasks } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getTasks);
router.post('/complete/:taskId', protect, completeTask);
router.get('/completed', protect, getCompletedTasks);

module.exports = router;
