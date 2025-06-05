const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes');
const { seedAdmin } = require('./controllers/authController');
const skillsRouter = require("./routes/skills");
const experienceRoutes = require("./routes/experience");
const projectRoutes = require("./routes/projects");
const contactRoutes = require("./routes/contact");
const resumeRoutes = require("./routes/resume");
const socialLinksRoutes = require("./routes/socialLinks");
const newsletterRoutes = require("./routes/newsletter");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Basic CORS setup
app.use(cors({
  origin: ['http://localhost:3000', 'https://portfolio-mern-shubhamkumarpatel70.vercel.app'],
  credentials: true
}));

app.use(express.json());

// Basic test route
app.get('/api/test', (req, res) => {
  try {
    res.json({ 
      message: 'Backend is working!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: err.message
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export the Express API
module.exports = app;
