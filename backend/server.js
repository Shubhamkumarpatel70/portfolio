const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
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
const session = require('express-session');
const MongoStore = require('connect-mongo');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://*.onrender.com']
    : 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make sure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
const logosDir = path.join(__dirname, 'uploads/logos');
const resumesDir = path.join(__dirname, 'uploads/resumes');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
  console.log('Created logos directory');
}

if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir, { recursive: true });
  console.log('Created resumes directory');
}

// Set up session before routes
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// Add a route to check authentication status
app.get('/api/auth/check', (req, res) => {
  if (req.session && req.session.userId) {
    res.status(200).json({ authenticated: true });
  } else {
    res.status(200).json({ authenticated: false });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use("/api/skills", skillsRouter);
app.use("/api/experience", experienceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/social-links", socialLinksRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
