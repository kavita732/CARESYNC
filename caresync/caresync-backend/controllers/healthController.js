const db = require('../database');

exports.logHealthMetric = (req, res) => {
  const { bloodSugar, systolicBP, diastolicBP, weight, medicationTaken, notes } = req.body;
  const userId = req.user.id;
  const date = new Date().toISOString().split('T')[0];

  db.run(
    `INSERT INTO health_metrics (user_id, date, blood_sugar, systolic_bp, diastolic_bp, weight, medication_taken, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, date, bloodSugar, systolicBP, diastolicBP, weight, medicationTaken || false, notes || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error logging health metric' });
      }

      res.status(201).json({
        message: 'Health metric logged successfully',
        metric: {
          id: this.lastID,
          user_id: userId,
          date,
          blood_sugar: bloodSugar,
          systolic_bp: systolicBP,
          diastolic_bp: diastolicBP,
          weight,
          medication_taken: medicationTaken || false,
          notes: notes || ''
        }
      });
    }
  );
};

exports.getHealthMetrics = (req, res) => {
  const userId = req.user.id;
  const { limit = 50 } = req.query;

  db.all(
    'SELECT * FROM health_metrics WHERE user_id = ? ORDER BY date DESC LIMIT ?',
    [userId, parseInt(limit)],
    (err, metrics) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({
        metrics,
        count: metrics.length
      });
    }
  );
};