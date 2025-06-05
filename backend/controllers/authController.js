const Admin = require('../models/Admin');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // First check if it's an admin
    const admin = await Admin.findOne({ email });
    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password);
      if (isMatch) {
        // Create a JWT token
        const token = jwt.sign(
          { id: admin._id, role: 'admin' },
          process.env.JWT_SECRET,
          { expiresIn: '1d' }
        );
        
        // Set session data
        req.session.userId = admin._id;
        req.session.role = 'admin';
        
        return res.json({ 
          message: 'Login successful',
          user: {
            id: admin._id,
            name: admin.name || 'Admin',
            email: admin.email,
            role: 'admin'
          },
          token
        });
      }
    }
    
    // If not admin, check if it's a regular user
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Create a JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Set session data
    req.session.userId = user._id;
    req.session.role = user.role;
    
    res.json({ 
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const register = async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;
  
  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    user = new User({
      name,
      email,
      password,
      role
    });
    
    await user.save();
    
    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMe = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    let user;
    if (req.session.role === 'admin') {
      user = await Admin.findById(req.session.userId).select('-password');
      if (user) {
        return res.json({
          id: user._id,
          email: user.email,
          role: 'admin'
        });
      }
    } else {
      user = await User.findById(req.session.userId).select('-password');
      if (user) {
        return res.json({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        });
      }
    }
    
    // If we get here, the user ID in the session is invalid
    req.session.destroy();
    return res.status(401).json({ message: 'Not authenticated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
};

const seedAdmin = async () => {
  const existing = await Admin.findOne({ email: 'admin@example.com' });
  if (!existing) {
    const hashed = await bcrypt.hash('admin123', 10);
    await Admin.create({ email: 'admin@example.com', password: hashed });
    console.log('Default admin created: admin@example.com / admin123');
  }
};

module.exports = { login, register, getMe, logout, seedAdmin };
