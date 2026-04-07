const express = require('express');
const router = express.Router();
const { getReferralInfo, getReferralStats } = require('../controllers/referralController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getReferralInfo);
router.get('/stats', protect, getReferralStats);

module.exports = router;
