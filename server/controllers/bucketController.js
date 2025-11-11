const Bucket = require('../models/Bucket');

exports.createBucket = async (req, res) => {
  try {
    const { name, profileIds } = req.body;

    if (!name || !profileIds || !Array.isArray(profileIds) || profileIds.length === 0) {
      return res.status(400).json({ message: 'Bucket name and at least one profile ID are required.' });
    }

    const newBucket = await Bucket.create({
      name,
      profiles: profileIds,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: 'Bucket created successfully!',
      bucket: newBucket,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllBuckets = async (req, res) => {
  try {
    // Fetch buckets created by the current admin
    const buckets = await Bucket.find({ createdBy: req.user._id })
      .populate('profiles', 'firstName surname department') // Populate with a few details for the card
      .sort({ createdAt: -1 });

    res.status(200).json({ buckets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBucket = async (req, res) => {
  try {
    const bucket = await Bucket.findById(req.params.id).populate({
      path: 'profiles',
      populate: {
        path: 'user',
        select: 'email role _id', // Populate user details within each profile
      },
    });

    if (!bucket) {
      return res.status(404).json({ message: 'Bucket not found' });
    }

    if (bucket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    res.status(200).json({ bucket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBucket = async (req, res) => {
  try {
    const bucket = await Bucket.findById(req.params.id);

    if (!bucket) {
      return res.status(404).json({ message: 'Bucket not found' });
    }

    if (bucket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized to delete this bucket' });
    }

    await bucket.deleteOne();

    res.status(200).json({ message: 'Bucket deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};