const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  image: String, // URL or filename
  link: String, // Main project link
  sourceCodeLink: String, // Link to source code repository
  featured: { type: Boolean, default: false },
  tags: [String] // Array of technology tags
});

module.exports = mongoose.model("Project", projectSchema);