const mongoose = require('mongoose');

const packageRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  packageSlug: { type: String, required: true },
  packageName: { type: String, required: true },
  amount: { type: Number, required: true },
  transactionId: { type: String, required: true },
  screenshotUrl: { type: String, required: true },
  paymentMethod: { type: String, enum: ['easypaisa', 'jazzcash'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote: { type: String, default: '' },
  reviewedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('PackageRequest', packageRequestSchema);
