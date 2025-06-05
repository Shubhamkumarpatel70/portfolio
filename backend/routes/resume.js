const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

// Configure multer for file uploads
const UPLOAD_DIR = path.resolve(__dirname, '../uploads/resumes');

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
    cb(null, 'resume-' + uniqueSuffix + ext);
  }
});

// File filter to only allow PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Upload a new resume (admin only)
router.post('/', protect, adminOnly, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Set all existing resumes to inactive
    await Resume.updateMany({}, { isActive: false });

    // Create new resume entry
    const newResume = new Resume({
      filename: req.file.originalname,
      path: req.file.path,
      url: req.body.url || null,
      isActive: true
    });

    await newResume.save();
    res.status(201).json({ 
      message: 'Resume uploaded successfully',
      resume: newResume
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: 'Failed to upload resume' });
  }
});

// Get active resume (admin only)
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const resume = await Resume.findOne({ isActive: true }).sort({ uploadDate: -1 });
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch resume' });
  }
});

// Check if resume is available (public endpoint)
router.get('/check', async (req, res) => {
  try {
    const resume = await Resume.findOne({ isActive: true });
    if (resume) {
      res.json({ available: true });
    } else {
      res.json({ available: false });
    }
  } catch (error) {
    console.error('Resume check error:', error);
    res.status(500).json({ message: 'Failed to check resume availability' });
  }
});

// View resume (authenticated users)
router.get('/view', async (req, res) => {
  try {
    if (req.session && req.session.userId) {
      // If authenticated, serve the resume for viewing
      const resume = await Resume.findOne({ isActive: true }).sort({ uploadDate: -1 });
      
      if (!resume) {
        return res.status(404).json({ message: 'No resume available' });
      }

      // If a URL is provided, redirect to it
      if (resume.url) {
        return res.redirect(resume.url);
      }

      // Check if file exists
      if (!fs.existsSync(resume.path)) {
        console.error('Resume file not found at path:', resume.path);
        return res.status(404).json({ message: 'Resume file not found' });
      }

      // Set content disposition to inline for viewing in browser
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${resume.filename}"`);
      
      // Create a read stream and pipe it to the response
      const fileStream = fs.createReadStream(resume.path);
      fileStream.pipe(res);
      
      // Handle errors in the stream
      fileStream.on('error', (err) => {
        console.error('Error streaming file:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error streaming file' });
        }
      });
    } else {
      // If not authenticated, return 401
      res.status(401).json({ message: 'Authentication required to view resume' });
    }
  } catch (error) {
    console.error('Resume view error:', error);
    res.status(500).json({ message: 'Failed to view resume' });
  }
});

// Get active resume for authenticated users
router.get('/', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ isActive: true }).sort({ uploadDate: -1 });
    
    if (!resume) {
      return res.status(404).json({ message: 'No resume available' });
    }

    // If a URL is provided, redirect to it
    if (resume.url) {
      return res.redirect(resume.url);
    }

    // Check if file exists
    if (!fs.existsSync(resume.path)) {
      console.error('Resume file not found at path:', resume.path);
      return res.status(404).json({ message: 'Resume file not found' });
    }

    // Check if the request is for viewing or downloading
    const disposition = req.query.view === 'true' ? 'inline' : 'attachment';
    
    // Send the file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${disposition}; filename="${resume.filename}"`);
    
    // Create a read stream and pipe it to the response
    const fileStream = fs.createReadStream(resume.path);
    fileStream.pipe(res);
    
    // Handle errors in the stream
    fileStream.on('error', (err) => {
      console.error('Error streaming file:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error streaming file' });
      }
    });
  } catch (error) {
    console.error('Resume download error:', error);
    res.status(500).json({ message: 'Failed to download resume' });
  }
});

// Public download route for backward compatibility (redirects to login if not authenticated)
router.get('/download', async (req, res) => {
  try {
    if (req.session && req.session.userId) {
      // If authenticated, serve the resume directly
      const resume = await Resume.findOne({ isActive: true }).sort({ uploadDate: -1 });
      
      if (!resume) {
        return res.status(404).json({ message: 'No resume available' });
      }

      // If a URL is provided, redirect to it
      if (resume.url) {
        return res.redirect(resume.url);
      }

      // Check if file exists
      if (!fs.existsSync(resume.path)) {
        console.error('Resume file not found at path:', resume.path);
        return res.status(404).json({ message: 'Resume file not found' });
      }

      // Check if the request is for viewing or downloading
      const disposition = req.query.view === 'true' ? 'inline' : 'attachment';
      
      // Send the file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `${disposition}; filename="${resume.filename}"`);
      
      // Create a read stream and pipe it to the response
      const fileStream = fs.createReadStream(resume.path);
      fileStream.pipe(res);
      
      // Handle errors in the stream
      fileStream.on('error', (err) => {
        console.error('Error streaming file:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error streaming file' });
        }
      });
    } else {
      // If not authenticated, return 401
      res.status(401).json({ message: 'Authentication required to download resume' });
    }
  } catch (error) {
    console.error('Resume download error:', error);
    res.status(500).json({ message: 'Failed to download resume' });
  }
});

// Update resume URL (admin only)
router.put('/url', protect, adminOnly, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }
    
    // Find the active resume
    const resume = await Resume.findOne({ isActive: true });
    
    if (!resume) {
      return res.status(404).json({ message: 'No active resume found' });
    }
    
    // Update the URL
    resume.url = url;
    await resume.save();
    
    res.json({ 
      message: 'Resume URL updated successfully',
      resume
    });
  } catch (error) {
    console.error('Resume URL update error:', error);
    res.status(500).json({ message: 'Failed to update resume URL' });
  }
});

// Delete a resume (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Delete the file from the filesystem
    if (fs.existsSync(resume.path)) {
      fs.unlinkSync(resume.path);
    }

    // Delete from database
    await Resume.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Resume delete error:', error);
    res.status(500).json({ message: 'Failed to delete resume' });
  }
});

module.exports = router;