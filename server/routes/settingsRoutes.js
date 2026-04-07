const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect } = require('../middleware/authMiddleware');

// GET /api/settings/payment-info — public for logged-in users
router.get('/payment-info', protect, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json({
      easypaisaNumber: settings.easypaisaNumber,
      easypaisaName: settings.easypaisaName,
      jazzcashNumber: settings.jazzcashNumber,
      jazzcashName: settings.jazzcashName,
      adminWhatsapp: settings.adminWhatsapp,
      minimumWithdraw: settings.minimumWithdraw,
      platformName: settings.platformName,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
