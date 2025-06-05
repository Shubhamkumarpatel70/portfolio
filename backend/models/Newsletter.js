const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  unsubscribeToken: {
    type: String,
    required: true,
    default: () => require('crypto').randomBytes(32).toString('hex')
  },
  lastEmailSent: {
    type: Date
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create indexes for faster lookups
newsletterSchema.index({ email: 1 });
newsletterSchema.index({ isActive: 1 });
newsletterSchema.index({ unsubscribeToken: 1 });

module.exports = mongoose.model('Newsletter', newsletterSchema);