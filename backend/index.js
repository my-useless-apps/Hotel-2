const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('calendar.db');

// Initialize database tables
db.serialize(() => {
  // Users table for admin authentication
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Events table
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date DATE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create default admin user if it doesn't exist
  const hashedPassword = bcrypt.hashSync('password', 10);
  db.run(
    'INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)',
    ['admin', hashedPassword]
  );

  // Add some sample events
  const sampleEvents = [
    ['New Year Celebration', '2025-01-01', 'Welcome 2025!'],
    ['Team Meeting', '2025-01-15', 'Monthly team sync'],
    ['Product Launch', '2025-02-01', 'Launch new features'],
    ['Valentine\'s Day', '2025-02-14', 'Day of love'],
    ['Spring Conference', '2025-03-20', 'Annual spring conference'],
    ['Earth Day', '2025-04-22', 'Environmental awareness day']
  ];

  sampleEvents.forEach(([title, date, description]) => {
    db.run(
      'INSERT OR IGNORE INTO events (title, date, description) VALUES (?, ?, ?)',
      [title, date, description]
    );
  });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Public Routes

// Get all events (public)
app.get('/api/events', (req, res) => {
  db.all('SELECT * FROM events ORDER BY date ASC', (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json(rows);
  });
});

// Get events by date range (public)
app.get('/api/events/range', (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ success: false, message: 'Start date and end date required' });
  }

  db.all(
    'SELECT * FROM events WHERE date BETWEEN ? AND ? ORDER BY date ASC',
    [startDate, endDate],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      res.json(rows);
    }
  );
});

// Admin Routes

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username }
    });
  });
});

// Get all events (admin)
app.get('/api/admin/events', authenticateToken, (req, res) => {
  db.all('SELECT * FROM events ORDER BY date ASC', (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json(rows);
  });
});

// Create new event (admin)
app.post('/api/admin/events', authenticateToken, (req, res) => {
  const { title, date, description } = req.body;

  if (!title || !date) {
    return res.status(400).json({ success: false, message: 'Title and date required' });
  }

  db.run(
    'INSERT INTO events (title, date, description) VALUES (?, ?, ?)',
    [title, date, description || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      res.json({
        success: true,
        event: { id: this.lastID, title, date, description }
      });
    }
  );
});

// Update event (admin)
app.put('/api/admin/events/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, date, description } = req.body;

  if (!title || !date) {
    return res.status(400).json({ success: false, message: 'Title and date required' });
  }

  db.run(
    'UPDATE events SET title = ?, date = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [title, date, description || '', id],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      
      res.json({ success: true, message: 'Event updated successfully' });
    }
  );
});

// Delete event (admin)
app.delete('/api/admin/events/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM events WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    res.json({ success: true, message: 'Event deleted successfully' });
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    db.close();
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    db.close();
  });
});

module.exports = app;
