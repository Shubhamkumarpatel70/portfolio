const mongoose = require('mongoose');

const socialLinkSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['github', 'linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'medium', 'dev.to', 'stackoverflow', 'website', 'email', 'other']
  },
  url: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'fas fa-link'
  },
  displayName: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('SocialLink', socialLinkSchema);