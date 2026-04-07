const express = require('express');
const router = express.Router();
const { submitWithdrawRequest, getWithdrawHistory, getPendingWithdraw } = require('../controllers/withdrawController');
const { protect } = require('../middleware/authMiddleware');

router.post('/request', protect, submitWithdrawRequest);
router.get('/history', protect, getWithdrawHistory);
router.get('/pending', protect, getPendingWithdraw);

module.exports = router;
