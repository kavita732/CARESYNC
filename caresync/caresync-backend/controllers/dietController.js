const db = require('../database');

exports.addFoodItem = (req, res) => {
  const { date, meal, foodName, calories, quantity } = req.body;
  const userId = req.user.id;

  const dietDate = date || new Date().toISOString().split('T')[0];

  db.run(
    `INSERT INTO diet_logs (user_id, date, meal_type, food_name, calories, quantity) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, dietDate, meal, foodName, calories, quantity || '1 serving'],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error adding food item' });
      }

      res.status(201).json({
        message: 'Food item added successfully',
        foodItem: {
          id: this.lastID,
          user_id: userId,
          date: dietDate,
          meal_type: meal,
          food_name: foodName,
          calories,
          quantity: quantity || '1 serving'
        }
      });
    }
  );
};

exports.getDietLog = (req, res) => {
  const userId = req.user.id;
  const { date } = req.query;
  const dietDate = date || new Date().toISOString().split('T')[0];

  db.all(
    'SELECT * FROM diet_logs WHERE user_id = ? AND date = ? ORDER BY meal_type, created_at',
    [userId, dietDate],
    (err, foods) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      // Group by meal type
      const dietLog = {
        breakfast: foods.filter(f => f.meal_type === 'breakfast'),
        lunch: foods.filter(f => f.meal_type === 'lunch'),
        snack: foods.filter(f => f.meal_type === 'snack'),
        dinner: foods.filter(f => f.meal_type === 'dinner')
      };

      // Calculate totals
      const totals = {
        breakfast: dietLog.breakfast.reduce((sum, item) => sum + item.calories, 0),
        lunch: dietLog.lunch.reduce((sum, item) => sum + item.calories, 0),
        snack: dietLog.snack.reduce((sum, item) => sum + item.calories, 0),
        dinner: dietLog.dinner.reduce((sum, item) => sum + item.calories, 0)
      };

      totals.total = totals.breakfast + totals.lunch + totals.snack + totals.dinner;

      res.json({
        dietLog,
        totals,
        date: dietDate
      });
    }
  );
};