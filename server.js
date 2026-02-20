const express = require('express');
const cors = require('cors');
const workoutRoutes = require('./src/routes/workout');

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🏋️ Fitness API running on port ${PORT}`);
});