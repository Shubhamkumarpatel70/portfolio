const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  url: {
    type: String,
    default: null
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Resume', resumeSchema);