const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Content', contentSchema);
