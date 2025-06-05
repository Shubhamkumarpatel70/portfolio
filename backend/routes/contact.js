const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

// Get all contacts - admin only
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get unread message count - admin only
router.get("/unread-count", protect, adminOnly, async (req, res) => {
  try {
    const count = await Contact.countDocuments({ isRead: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit contact form - public route
router.post("/", async (req, res) => {
  const { name, email, message } = req.body;
  const contact = new Contact({ name, email, message });
  try {
    const newContact = await contact.save();
    res.status(201).json(newContact);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Mark message as read - admin only
router.patch("/:id/read", protect, adminOnly, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id, 
      { isRead: true },
      { new: true }
    );
    
    if (!contact) return res.status(404).json({ message: "Message not found" });
    res.json(contact);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete contact - admin only
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;