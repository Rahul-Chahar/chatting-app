// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: 'No token provided.' });
    
  const token = authHeader.split(' ')[1];
  if (!token)
    return res.status(401).json({ message: 'No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded; // e.g., { id: user.id }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};
