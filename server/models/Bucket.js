const mongoose = require('mongoose');
const crypto = require('crypto');

const bucketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Bucket name is required'],
    trim: true,
  },
  profiles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  shareToken: {
    type: String,
    unique: true,
  },
}, { timestamps: true });

bucketSchema.pre('save', function(next) {
  if (!this.shareToken) {
    this.shareToken = crypto.randomBytes(16).toString('hex');
  }
  next();
});

module.exports = mongoose.model('Bucket', bucketSchema);