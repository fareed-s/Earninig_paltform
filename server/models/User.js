const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, required: true, trim: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  // Package Info
  package: { type: String, enum: ['none', 'starter', 'standard', 'pro'], default: 'none' },
  packageActivatedAt: { type: Date, default: null },
  earningMultiplier: { type: Number, default: 0 },
  dailyTaskLimit: { type: Number, default: 0 },
  referralCommissionPercent: { type: Number, default: 0 },

  // Wallet
  walletBalance: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  referralEarnings: { type: Number, default: 0 },

  // Tasks
  tasksCompletedToday: { type: Number, default: 0 },
  lastTaskDate: { type: Date, default: null },
  completedTaskIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],

  // Referral
  referralCode: { type: String, unique: true },
  referredBy: { type: String, default: null },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

// Generate referral code
userSchema.pre('save', function (next) {
  if (!this.referralCode) {
    this.referralCode = this._id
      ? this._id.toString().slice(-4).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase()
      : Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
