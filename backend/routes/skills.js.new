const express = require("express");
const router = express.Router();
const Skill = require("../models/Skill");
const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/skills');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|svg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// GET all skills - public route
router.get("/", async (req, res) => {
  try {
    const skills = await Skill.find();
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET skills by category - public route
router.get("/category/:category", async (req, res) => {
  try {
    const skills = await Skill.find({ category: req.params.category });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD a skill - admin only
router.post("/", protect, adminOnly, upload.single('icon'), async (req, res) => {
  try {
    const { name, proficiency, category, iconUrl } = req.body;
    
    if (!name) return res.status(400).json({ error: "Name is required" });
    
    let iconValue = '';
    
    // If file was uploaded, use its path
    if (req.file) {
      iconValue = `/uploads/skills/${req.file.filename}`;
    } 
    // If iconUrl was provided, use it
    else if (iconUrl) {
      iconValue = iconUrl;
    }
    
    const skill = new Skill({ 
      name, 
      proficiency: proficiency || 75,
      category: category || 'other',
      icon: iconValue
    });
    
    await skill.save();
    res.status(201).json(skill);
  } catch (err) {
    console.error("Error adding skill:", err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE a skill - admin only
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE a skill - admin only
router.put("/:id", protect, adminOnly, upload.single('icon'), async (req, res) => {
  try {
    const { name, proficiency, category, iconUrl, existingIcon } = req.body;
    
    // Build update data object
    const updateData = {};
    
    // Only update fields that are provided
    if (name) updateData.name = name;
    if (proficiency) updateData.proficiency = proficiency;
    if (category) updateData.category = category;
    
    // Handle icon update
    if (req.file) {
      // If a new file was uploaded
      updateData.icon = `/uploads/skills/${req.file.filename}`;
    } else if (iconUrl) {
      // If an icon URL was provided
      updateData.icon = iconUrl;
    } else if (existingIcon) {
      // If we're keeping the existing icon (no need to update it)
      // Don't include icon in updateData to keep the existing value
    } else {
      // If no icon is provided, set it to empty
      updateData.icon = '';
    }
    
    // Find the skill and update it
    const skill = await Skill.findById(req.params.id);
    
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }
    
    // Update the skill
    const updatedSkill = await Skill.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.json(updatedSkill);
  } catch (err) {
    console.error("Error updating skill:", err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;