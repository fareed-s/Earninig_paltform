const express = require('express');
const router = express.Router();
const { getPackages, submitPackageRequest, getMyPackageRequest, upload } = require('../controllers/packageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getPackages);
router.post('/request', protect, upload.single('screenshot'), submitPackageRequest);
router.get('/my-request', protect, getMyPackageRequest);

module.exports = router;
