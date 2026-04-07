const User = require('../models/User');
const WithdrawRequest = require('../models/WithdrawRequest');
const Transaction = require('../models/Transaction');
const Settings = require('../models/Settings');

// POST /api/withdraw/request
const submitWithdrawRequest = async (req, res) => {
  try {
    const { amount, method, accountNumber, accountTitle, bankName } = req.body;
    const user = await User.findById(req.user._id);

    // Validate package
    if (user.package === 'none') {
      return res.status(403).json({ message: 'You need an active package to withdraw' });
    }

    // Get settings
    const settings = await Settings.findOne();
    const minWithdraw = settings ? settings.minimumWithdraw : 500;

    // Validate amount
    if (!amount || amount < minWithdraw) {
      return res.status(400).json({ message: `Minimum withdrawal amount is Rs ${minWithdraw}` });
    }

    if (user.walletBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Check pending withdrawal
    const pendingWithdraw = await WithdrawRequest.findOne({
      userId: user._id,
      status: 'pending',
    });
    if (pendingWithdraw) {
      return res.status(400).json({ message: 'You already have a pending withdrawal request' });
    }

    // Validate fields
    if (!method || !accountNumber || !accountTitle) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (method === 'bank' && !bankName) {
      return res.status(400).json({ message: 'Bank name is required for bank transfers' });
    }

    // Deduct balance immediately
    user.walletBalance -= amount;
    await user.save();

    // Create withdraw request
    const withdrawRequest = await WithdrawRequest.create({
      userId: user._id,
      amount,
      method,
      accountNumber,
      accountTitle,
      bankName: bankName || '',
    });

    // Create transaction record
    await Transaction.create({
      userId: user._id,
      amount: -amount,
      type: 'withdraw_debit',
      description: `Withdrawal request of Rs ${amount} via ${method}`,
    });

    res.status(201).json({ message: 'Withdrawal request submitted', request: withdrawRequest });
  } catch (error) {
    console.error('Withdraw request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/withdraw/history
const getWithdrawHistory = async (req, res) => {
  try {
    const requests = await WithdrawRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/withdraw/pending
const getPendingWithdraw = async (req, res) => {
  try {
    const pending = await WithdrawRequest.findOne({ userId: req.user._id, status: 'pending' });
    res.json({ hasPending: !!pending, request: pending });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { submitWithdrawRequest, getWithdrawHistory, getPendingWithdraw };
