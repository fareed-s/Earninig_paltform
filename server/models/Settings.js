const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  easypaisaNumber: { type: String, default: '03001234567' },
  easypaisaName: { type: String, default: 'Platform Account' },
  jazzcashNumber: { type: String, default: '03001234567' },
  jazzcashName: { type: String, default: 'Platform Account' },
  adminWhatsapp: { type: String, default: '03001234567' },
  minimumWithdraw: { type: Number, default: 500 },
  platformName: { type: String, default: 'EarnHub' },
  isMaintenanceMode: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
