const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const dotenv = require('dotenv');
dotenv.config();

// Middleware to validate API key (optional but recommended)
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {

    return res.status(401).json({ error: 'Invalid API key',api:process.env.API_KEY,h:"vvvv" });
  }
  next();
};

// Apply API key validation to all routes
router.use(validateApiKey);

// Generate workout plan
router.post('/generate', workoutController.generateWorkout);

// Get specific exercise by ID
router.get('/exercise/:id', workoutController.getExerciseById);

// Get all exercises (with pagination)
router.get('/exercises', async (req, res) => {
  try {
    const dbService = require('../services/databaseService');
    const exercises = await dbService.getAllExercises();
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;