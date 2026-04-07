const mongoose = require('mongoose');

const withdrawRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['easypaisa', 'jazzcash', 'bank'], required: true },
  accountNumber: { type: String, required: true },
  accountTitle: { type: String, required: true },
  bankName: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'paid', 'rejected'], default: 'pending' },
  adminNote: { type: String, default: '' },
  paidAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('WithdrawRequest', withdrawRequestSchema);
