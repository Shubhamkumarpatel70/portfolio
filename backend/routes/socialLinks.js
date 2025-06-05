const express = require('express');
const router = express.Router();
const SocialLink = require('../models/SocialLink');
const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

// Get all social links (public)
router.get('/', async (req, res) => {
  try {
    const socialLinks = await SocialLink.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json(socialLinks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all social links (admin only, includes inactive)
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const socialLinks = await SocialLink.find().sort({ displayOrder: 1 });
    res.json(socialLinks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new social link (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  const { platform, url, icon, displayName, isActive, displayOrder } = req.body;
  
  try {
    const newSocialLink = new SocialLink({
      platform,
      url,
      icon,
      displayName,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0
    });
    
    const savedLink = await newSocialLink.save();
    res.status(201).json(savedLink);
  } catch (err) {
    console.error('Error creating social link:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update a social link (admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { platform, url, icon, isActive, displayOrder } = req.body;
    
    // Update the updatedAt timestamp
    req.body.updatedAt = Date.now();
    
    const updatedLink = await SocialLink.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!updatedLink) {
      return res.status(404).json({ message: 'Social link not found' });
    }
    
    res.json(updatedLink);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a social link (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const deletedLink = await SocialLink.findByIdAndDelete(req.params.id);
    
    if (!deletedLink) {
      return res.status(404).json({ message: 'Social link not found' });
    }
    
    res.json({ message: 'Social link deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;