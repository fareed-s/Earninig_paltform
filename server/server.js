const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Package = require('./models/Package');
const Settings = require('./models/Settings');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/packages', require('./routes/packageRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/withdraw', require('./routes/withdrawRoutes'));
app.use('/api/referral', require('./routes/referralRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Seed function
const seedData = async () => {
  try {
    // Seed admin
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!adminExists) {
      await User.create({
        name: process.env.ADMIN_NAME || 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@platform.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        phone: '03000000000',
        role: 'admin',
        referralCode: 'ADMIN001',
      });
      console.log('✅ Admin account seeded');
    }

    // Seed packages
    const pkgCount = await Package.countDocuments();
    if (pkgCount === 0) {
      await Package.insertMany([
        {
          name: 'Starter', slug: 'starter', price: 500,
          earningMultiplier: 1, dailyTaskLimit: 10,
          referralCommissionPercent: 5,
          description: 'Perfect for beginners. Start earning with basic tasks.',
        },
        {
          name: 'Standard', slug: 'standard', price: 1000,
          earningMultiplier: 2, dailyTaskLimit: 25,
          referralCommissionPercent: 10,
          description: 'Most popular choice. Double your earnings!',
        },
        {
          name: 'Pro', slug: 'pro', price: 2000,
          earningMultiplier: 3, dailyTaskLimit: 999,
          referralCommissionPercent: 15,
          description: 'Maximum earnings with unlimited daily tasks.',
        },
      ]);
      console.log('✅ Packages seeded');
    }

    // Seed settings
    const settingsExist = await Settings.findOne();
    if (!settingsExist) {
      await Settings.create({});
      console.log('✅ Settings seeded');
    }

    // Seed sample tasks
    const Task = require('./models/Task');
    const taskCount = await Task.countDocuments();
    if (taskCount === 0) {
      await Task.insertMany([
        { title: 'Watch YouTube Video', description: 'Watch a promotional video for 30 seconds', reward: 10, type: 'video', duration: 30 },
        { title: 'Visit Sponsor Website', description: 'Visit and browse the sponsor website for 15 seconds', reward: 5, type: 'click', duration: 15 },
        { title: 'Complete Survey', description: 'Answer a short survey about your preferences', reward: 20, type: 'survey', duration: 60 },
        { title: 'Follow Social Page', description: 'Follow our sponsor on social media', reward: 15, type: 'social', duration: 20 },
        { title: 'Watch Product Demo', description: 'Watch a product demonstration video', reward: 12, type: 'video', duration: 45 },
        { title: 'Click Ad Campaign', description: 'View and interact with an advertisement', reward: 8, type: 'click', duration: 10 },
      ]);
      console.log('✅ Sample tasks seeded');
    }
  } catch (error) {
    console.error('Seed error:', error);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  seedData();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
