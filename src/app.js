const express = require('express');
const cors = require('cors');
const workoutRoutes = require('./routes/workout');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/workout', workoutRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = app;