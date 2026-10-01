const jwt = require('jsonwebtoken');
const db = require('../database');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    db.get(
      'SELECT id, name, email, age, gender, disease, parent_mobile FROM users WHERE id = ?',
      [decoded.userId],
      (err, user) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' });
        }

        if (!user) {
          return res.status(401).json({ message: 'Token is not valid' });
        }

        req.user = user;
        next();
      }
    );
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;