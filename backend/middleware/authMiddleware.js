const jwt = require('jsonwebtoken');

/**
 * Middleware to check if the user is authenticated
 * Checks both session and JWT token
 */
const protect = (req, res, next) => {
  // First check session
  if (req.session && req.session.userId) {
    return next();
  }
  
  // If no session, check for token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Set session data from token
      req.session.userId = decoded.id;
      req.session.role = decoded.role;
      
      return next();
    } catch (error) {
      console.error('Token verification failed:', error);
    }
  }
  
  // Check for cookies that might contain the token
  if (req.cookies && req.cookies.token) {
    try {
      const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
      
      // Set session data from token
      req.session.userId = decoded.id;
      req.session.role = decoded.role;
      
      return next();
    } catch (error) {
      console.error('Cookie token verification failed:', error);
    }
  }
  
  // If we get here, authentication failed
  return res.status(401).json({ message: 'Not authenticated' });
};

module.exports = protect;
