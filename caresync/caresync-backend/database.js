const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'caresync.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    disease TEXT DEFAULT '',
    parent_mobile TEXT,
    avatar TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Reminders table
  db.run(`CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    repeat TEXT DEFAULT 'once',
    custom_days TEXT,
    completed BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // Diet logs table
  db.run(`CREATE TABLE IF NOT EXISTS diet_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    meal_type TEXT NOT NULL,
    food_name TEXT NOT NULL,
    calories INTEGER NOT NULL,
    quantity TEXT DEFAULT '1 serving',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // Health metrics table
  db.run(`CREATE TABLE IF NOT EXISTS health_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    blood_sugar REAL,
    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    weight REAL,
    medication_taken BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // Lab testers table
  db.run(`CREATE TABLE IF NOT EXISTS lab_testers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    rating REAL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, () => {
    // Insert sample lab testers
    insertSampleLabTesters();
  });

  console.log('✅ Database tables created successfully');
}

function insertSampleLabTesters() {
  const testers = [
    ["CureNext Diagnostics", "Mumbai", "12 Marine Drive, Churchgate", "+91 22 4500 1188", "info@curenext.com", 4.5],
    ["MetroPath Labs", "Delhi", "78 Defence Colony, New Delhi", "+91 11 3500 7799", "info@metropath.com", 4.3],
    ["PulseSure Diagnostics", "Bengaluru", "44 Outer Ring Road, HSR Layout", "+91 80 6123 4000", "info@pulsesure.com", 4.7],
    ["BayCare Path Labs", "Chennai", "210 TTK Road, Alwarpet", "+91 44 4999 2255", "info@baycare.com", 4.2],
    ["VitalPath Labs", "Pune", "88 Baner-Pashan Link Road", "+91 20 7100 6600", "info@vitalpath.com", 4.4]
  ];

  testers.forEach(tester => {
    db.run(`INSERT OR IGNORE INTO lab_testers (name, city, address, phone, email, rating) VALUES (?, ?, ?, ?, ?, ?)`, tester);
  });
}

module.exports = db;