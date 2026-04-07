const Package = require('../models/Package');
const PackageRequest = require('../models/PackageRequest');
const multer = require('multer');
const path = require('path');

// Multer config for screenshot upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// GET /api/packages
const getPackages = async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true }).sort({ price: 1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/packages/request
const submitPackageRequest = async (req, res) => {
  try {
    const { packageSlug, transactionId, paymentMethod } = req.body;

    if (!packageSlug || !transactionId || !paymentMethod) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Screenshot is required' });
    }

    const pkg = await Package.findOne({ slug: packageSlug, isActive: true });
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }

    // Check if user already has a pending request
    const pendingReq = await PackageRequest.findOne({
      userId: req.user._id,
      status: 'pending',
    });
    if (pendingReq) {
      return res.status(400).json({ message: 'You already have a pending package request' });
    }

    const packageRequest = await PackageRequest.create({
      userId: req.user._id,
      packageSlug: pkg.slug,
      packageName: pkg.name,
      amount: pkg.price,
      transactionId: transactionId.trim(),
      screenshotUrl: `/uploads/${req.file.filename}`,
      paymentMethod,
    });

    res.status(201).json({ message: 'Package request submitted successfully', request: packageRequest });
  } catch (error) {
    console.error('Package request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/packages/my-request
const getMyPackageRequest = async (req, res) => {
  try {
    const request = await PackageRequest.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getPackages, submitPackageRequest, getMyPackageRequest, upload };
