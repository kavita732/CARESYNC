const db = require('../database');

exports.getLabTesters = (req, res) => {
  const { city, search } = req.query;

  let query = 'SELECT * FROM lab_testers WHERE is_active = TRUE';
  let params = [];

  if (city) {
    query += ' AND city LIKE ?';
    params.push(`%${city}%`);
  }

  if (search) {
    query += ' AND (name LIKE ? OR address LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY city, name';

  db.all(query, params, (err, testers) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    res.json({ testers });
  });
};