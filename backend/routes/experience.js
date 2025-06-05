const express = require("express");
const router = express.Router();
const Experience = require("../models/Experience");
const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const UPLOAD_DIR = path.resolve(__dirname, '../uploads/logos');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Create directory if it doesn't exist
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: function(req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'logo-' + uniqueSuffix + ext);
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB max file size
  }
});

// Get all experience - public route
router.get("/", async (req, res) => {
  try {
    // Sort by order first (for custom ordering), then by startDate in descending order (newest first)
    const experience = await Experience.find().sort({ order: 1, startDate: -1 });
    res.json(experience);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get latest experiences (limited) - public route
router.get("/latest/:limit", async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 3; // Default to 3 if not specified
    const experience = await Experience.find()
      .sort({ startDate: -1 })
      .limit(limit);
    res.json(experience);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get latest experiences with default limit - public route
router.get("/latest", async (req, res) => {
  try {
    const experience = await Experience.find()
      .sort({ startDate: -1 })
      .limit(3); // Default to 3
    res.json(experience);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new experience - admin only
router.post("/", protect, adminOnly, upload.single('logo'), async (req, res) => {
  try {
    const experienceData = { ...req.body };
    
    // Parse JSON strings back to arrays
    if (experienceData.technologies) {
      try {
        experienceData.technologies = JSON.parse(experienceData.technologies);
      } catch (e) {
        console.error("Error parsing technologies:", e);
        // If it's already an array, no need to parse
        if (!Array.isArray(experienceData.technologies)) {
          experienceData.technologies = [];
        }
      }
    }
    
    if (experienceData.achievements) {
      try {
        experienceData.achievements = JSON.parse(experienceData.achievements);
      } catch (e) {
        console.error("Error parsing achievements:", e);
        // If it's already an array, no need to parse
        if (!Array.isArray(experienceData.achievements)) {
          experienceData.achievements = [];
        }
      }
    }
    
    // Handle logo file upload or URL
    if (req.file) {
      // If a file was uploaded, use the file path
      const relativePath = `/uploads/logos/${req.file.filename}`;
      experienceData.companyLogo = relativePath;
      console.log("Logo file uploaded:", relativePath);
    } else {
      console.log("Using provided logo URL:", experienceData.companyLogo);
    }
    
    console.log("Creating experience with data:", JSON.stringify(experienceData));
    const experience = new Experience(experienceData);
    const newExperience = await experience.save();
    console.log("Experience created successfully:", newExperience._id);
    res.status(201).json(newExperience);
  } catch (err) {
    console.error("Error creating experience:", err);
    res.status(400).json({ message: err.message });
  }
});

// Update experience - admin only
router.put("/:id", protect, adminOnly, upload.single('logo'), async (req, res) => {
  try {
    const experienceData = { ...req.body };
    
    // Parse JSON strings back to arrays
    if (experienceData.technologies) {
      try {
        experienceData.technologies = JSON.parse(experienceData.technologies);
      } catch (e) {
        console.error("Error parsing technologies:", e);
        // If it's already an array, no need to parse
        if (!Array.isArray(experienceData.technologies)) {
          experienceData.technologies = [];
        }
      }
    }
    
    if (experienceData.achievements) {
      try {
        experienceData.achievements = JSON.parse(experienceData.achievements);
      } catch (e) {
        console.error("Error parsing achievements:", e);
        // If it's already an array, no need to parse
        if (!Array.isArray(experienceData.achievements)) {
          experienceData.achievements = [];
        }
      }
    }
    
    // Handle logo file upload or URL
    if (req.file) {
      // If a file was uploaded, use the file path
      const relativePath = `/uploads/logos/${req.file.filename}`;
      experienceData.companyLogo = relativePath;
      console.log("Logo file uploaded:", relativePath);
      
      // Delete old logo file if it exists and is not a URL
      const oldExperience = await Experience.findById(req.params.id);
      if (oldExperience && oldExperience.companyLogo && !oldExperience.companyLogo.startsWith('http')) {
        const oldLogoPath = path.join(__dirname, '..', oldExperience.companyLogo);
        if (fs.existsSync(oldLogoPath)) {
          try {
            fs.unlinkSync(oldLogoPath);
            console.log("Deleted old logo file:", oldLogoPath);
          } catch (e) {
            console.error("Error deleting old logo file:", e);
          }
        }
      }
    } else if (experienceData.companyLogo === "") {
      // If logo field is empty, check if we need to remove an existing logo
      const oldExperience = await Experience.findById(req.params.id);
      if (oldExperience && oldExperience.companyLogo && !oldExperience.companyLogo.startsWith('http')) {
        const oldLogoPath = path.join(__dirname, '..', oldExperience.companyLogo);
        if (fs.existsSync(oldLogoPath)) {
          try {
            fs.unlinkSync(oldLogoPath);
            console.log("Deleted old logo file:", oldLogoPath);
          } catch (e) {
            console.error("Error deleting old logo file:", e);
          }
        }
      }
    } else {
      console.log("Using provided logo URL or keeping existing:", experienceData.companyLogo);
    }
    
    console.log("Updating experience with data:", JSON.stringify(experienceData));
    const updated = await Experience.findByIdAndUpdate(
      req.params.id,
      experienceData,
      { new: true }
    );
    
    if (!updated) return res.status(404).json({ message: "Not found" });
    console.log("Experience updated successfully:", updated._id);
    res.json(updated);
  } catch (err) {
    console.error("Error updating experience:", err);
    res.status(400).json({ message: err.message });
  }
});

// Delete experience - admin only
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const deleted = await Experience.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;