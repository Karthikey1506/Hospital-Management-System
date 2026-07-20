const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'medpulse_super_secret_jwt_key_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired authentication token.' });
  }
}

function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    if (typeof roles === 'string') roles = [roles];
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Forbidden. Role '${req.user.role}' lacks permission for this action. Required: [${roles.join(', ')}]` 
      });
    }
    next();
  };
}

module.exports = { authenticateToken, requireRole, JWT_SECRET };
