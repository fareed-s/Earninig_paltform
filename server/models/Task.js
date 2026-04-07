const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  reward: { type: Number, required: true },
  type: { type: String, enum: ['video', 'click', 'survey', 'social'], required: true },
  duration: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
