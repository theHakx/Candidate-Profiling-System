const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const bucketController = require('../controllers/bucketController');

router.post('/', protect, isAdmin, bucketController.createBucket);
router.get('/', protect, isAdmin, bucketController.getAllBuckets);
router.get('/:id', protect, isAdmin, bucketController.getBucket);
router.delete('/:id', protect, isAdmin, bucketController.deleteBucket);

module.exports = router;