const jwt = require('jsonwebtoken');
const config = require('../utils/config'); // Import the config to get SECRET_KEY

// JWT middleware to verify token
const authMiddleware = (req, res, next) => {
  try {
    // Extract token from headers
    const authHeader =  req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header is missing' });
    }

    // Extract token from "Bearer <token>" format or plain token
    const token = authHeader.startsWith('Bearer') ? authHeader.split(' ')[1] : authHeader;
console.log(process.env.ACCESS_TOKEN_SECRET)
    // Verify the token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }

      // Attach decoded user data to the request object
      req.user = decoded;
      next(); // Pass to the next middleware/route handler
    });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred during authentication' });
  }
};

module.exports = authMiddleware;