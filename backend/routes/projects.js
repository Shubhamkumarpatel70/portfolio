const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

// Get all projects - public route
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get featured projects - public route
router.get("/featured", async (req, res) => {
  try {
    const projects = await Project.find({ featured: true });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new project - admin only
router.post("/", protect, adminOnly, async (req, res) => {
  const { 
    title, 
    description, 
    image, 
    link, 
    sourceCodeLink,
    tags,
    featured 
  } = req.body;
  
  const project = new Project({ 
    title, 
    description, 
    image, 
    link, 
    sourceCodeLink,
    tags,
    featured 
  });
  
  try {
    const newProject = await project.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update project - admin only
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete project - admin only
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;