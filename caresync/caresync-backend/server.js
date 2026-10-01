const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./database'); // Initialize database

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./controllers/authController'));
app.use('/api/reminders', require('./middleware/auth'), require('./controllers/reminderController'));
app.use('/api/diet', require('./middleware/auth'), require('./controllers/dietController'));
app.use('/api/health', require('./middleware/auth'), require('./controllers/healthController'));
app.use('/api/labs', require('./controllers/labController'));

// Profile route
app.get('/api/profile', require('./middleware/auth'), require('./controllers/authController').getProfile);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'CARESYNC API is running with SQLite',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API URL: http://localhost:${PORT}/api`);
});