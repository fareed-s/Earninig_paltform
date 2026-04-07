const User = require('../models/User');
const Transaction = require('../models/Transaction');

// GET /api/referral
const getReferralInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      referralCode: user.referralCode,
      referralLink: `${req.protocol}://${req.get('host')}/register?ref=${user.referralCode}`,
      referralCommissionPercent: user.referralCommissionPercent,
      hasPackage: user.package !== 'none',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/referral/stats
const getReferralStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const referredUsers = await User.find({ referredBy: user.referralCode })
      .select('name createdAt package')
      .sort({ createdAt: -1 });

    const referralTransactions = await Transaction.find({
      userId: user._id,
      type: 'referral_earning',
    }).sort({ createdAt: -1 }).limit(20);

    res.json({
      totalReferred: referredUsers.length,
      totalReferralEarnings: user.referralEarnings,
      referredUsers,
      recentCommissions: referralTransactions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getReferralInfo, getReferralStats };
