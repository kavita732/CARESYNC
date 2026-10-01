const db = require('../database');

exports.createReminder = (req, res) => {
  const { type, title, description, date, time, repeat, customDays } = req.body;
  const userId = req.user.id;

  db.run(
    `INSERT INTO reminders (user_id, type, title, description, date, time, repeat, custom_days) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, type, title, description, date, time, repeat, JSON.stringify(customDays)],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error creating reminder' });
      }

      res.status(201).json({
        message: 'Reminder created successfully',
        reminder: {
          id: this.lastID,
          user_id: userId,
          type,
          title,
          description,
          date,
          time,
          repeat,
          custom_days: customDays,
          completed: false
        }
      });
    }
  );
};

exports.getReminders = (req, res) => {
  const userId = req.user.id;
  const { date } = req.query;

  let query = 'SELECT * FROM reminders WHERE user_id = ? AND active = TRUE';
  let params = [userId];

  if (date) {
    query += ' AND date = ?';
    params.push(date);
  }

  query += ' ORDER BY date, time';

  db.all(query, params, (err, reminders) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    // Parse custom_days from JSON string
    const parsedReminders = reminders.map(reminder => ({
      ...reminder,
      custom_days: reminder.custom_days ? JSON.parse(reminder.custom_days) : []
    }));

    res.json({
      reminders: parsedReminders,
      count: parsedReminders.length
    });
  });
};

exports.deleteReminder = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.run(
    'UPDATE reminders SET active = FALSE WHERE id = ? AND user_id = ?',
    [id, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Reminder not found' });
      }

      res.json({ message: 'Reminder deleted successfully' });
    }
  );
};