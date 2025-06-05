const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  proficiency: { type: Number, min: 0, max: 100, default: 75 },
  category: { 
    type: String, 
    enum: ['frontend', 'backend', 'database', 'devops', 'other'],
    default: 'other'
  },
  icon: { type: String, default: '' }
});

module.exports = mongoose.model("Skill", skillSchema);