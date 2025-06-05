const express = require('express');
const router = express.Router();
const { getContent, updateContent } = require('../controllers/contentController');
const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

router.get('/', getContent);
// Use both middlewares - first check if authenticated, then check if admin
router.put('/', protect, adminOnly, updateContent);

module.exports = router;
