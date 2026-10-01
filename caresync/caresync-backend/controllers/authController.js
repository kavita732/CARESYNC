const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = (req, res) => {
  const { name, email, password, age, gender, disease, parentMobile } = req.body;

  // Check if user exists
  db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (row) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Insert user
      db.run(
        `INSERT INTO users (name, email, password, age, gender, disease, parent_mobile) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, email, hashedPassword, age, gender, disease || '', parentMobile || ''],
        function(err) {
          if (err) {
            return res.status(500).json({ message: 'Error creating user' });
          }

          const token = generateToken(this.lastID);

          res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
              id: this.lastID,
              name,
              email,
              age,
              gender,
              disease: disease || '',
              parentMobile: parentMobile || '',
              avatar: name.charAt(0).toUpperCase()
            }
          });
        }
      );
    } catch (error) {
      res.status(500).json({ message: 'Server error during registration' });
    }
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user.id);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          age: user.age,
          gender: user.gender,
          disease: user.disease,
          parentMobile: user.parent_mobile,
          avatar: user.name.charAt(0).toUpperCase()
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error during login' });
    }
  });
};

exports.getProfile = (req, res) => {
  const userId = req.user.id;

  db.get(
    'SELECT id, name, email, age, gender, disease, parent_mobile FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        user: {
          ...user,
          avatar: user.name.charAt(0).toUpperCase()
        }
      });
    }
  );
};