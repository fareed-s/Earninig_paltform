const User = require('../models/User');
const Transaction = require('../models/Transaction');

// GET /api/wallet
const getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance totalEarnings referralEarnings');
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      walletBalance: user.walletBalance,
      totalEarnings: user.totalEarnings,
      referralEarnings: user.referralEarnings,
      transactions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getWallet };
