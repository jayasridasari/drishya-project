// src/middleware/auth.js
 const jwt = require('jsonwebtoken');
 const authenticate = (req, res, next) => {
 const header = req.headers.authorization;
 if (!header || !header.startsWith('Bearer ')) {
 return res.status(401).json({ error: 'Access token required' });
 }
 try {
 const token = header.slice(7);
 req.user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
 next();
 } catch (error) {
 const message = error.name === 'TokenExpiredError' 
? 'Token expired' 
: 'Invalid token';
 return res.status(401).json({ error: message });
 }
};
 const requireAdmin = (req, res, next) => {
 if (req.user.role !== 'admin') {
 return res.status(403).json({ error: 'Admin access required' });
 }
 next();
 };
 module.exports = { authenticate, requireAdmin };