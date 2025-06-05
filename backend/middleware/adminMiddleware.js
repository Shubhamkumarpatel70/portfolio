const jwt = require('jsonwebtoken');

/**
 * Middleware to check if the user has admin role
 * This can be used independently or after the authMiddleware
 */
const adminMiddleware = (req, res, next) => {
  // First check session
  if (req.session && req.session.userId && req.session.role === 'admin') {
    return next();
  }
  
  // If no session or not admin in session, check for token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token has admin role
      if (decoded.role === 'admin') {
        // Set session data from token
        req.session.userId = decoded.id;
        req.session.role = 'admin';
        
        return next();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
    }
  }
  
  // If we get here, user is not an admin
  return res.status(403).json({ 
    message: 'Access denied. Admin privileges required.' 
  });
};

module.exports = adminMiddleware;