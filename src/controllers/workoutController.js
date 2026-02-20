const databaseService = require('../services/databaseService');
const geminiService = require('../services/geminiService');
const { performance } = require('perf_hooks');

class WorkoutController {
  constructor() {
    this.generateWorkout = this.generateWorkout.bind(this);
  }

  async generateWorkout(req, res) {
    const totalStart = performance.now();

    try {
      const { target_muscle, duration_minutes } = req.body;

      // Validate input
      if (!target_muscle || !duration_minutes) {
        return res.status(400).json({
          error: 'Missing required fields: target_muscle and duration_minutes'
        });
      }

      if (duration_minutes < 5 || duration_minutes > 120) {
        return res.status(400).json({
          error: 'Duration must be between 5 and 120 minutes'
        });
      }

      /* ---------------- STEP 1: Fetch exercises ---------------- */
      const dbAllStart = performance.now();
      const allExercises = await databaseService.getAllExercises();
      const dbAllEnd = performance.now();

      console.log(
        `[Timing] getAllExercises took ${(dbAllEnd - dbAllStart).toFixed(2)} ms`
      );

      if (!allExercises.length) {
        return res.status(500).json({ error: 'No exercises found in database' });
      }

      /* ---------------- STEP 2: Gemini AI ---------------- */
      const aiStart = performance.now();
      const aiPlan = await geminiService.generateWorkoutPlan(
        target_muscle,
        duration_minutes,
        allExercises
      );
      const aiEnd = performance.now();

      console.log(
        `[Timing] Gemini generateWorkoutPlan took ${(aiEnd - aiStart).toFixed(2)} ms`
      );

      /* ---------------- STEP 3: Extract IDs ---------------- */
      const extractStart = performance.now();
      const exerciseIds = this.extractExerciseIds(aiPlan);
      const extractEnd = performance.now();

      console.log(
        `[Timing] extractExerciseIds took ${(extractEnd - extractStart).toFixed(2)} ms`
      );

      /* ---------------- STEP 4: Fetch exercise details ---------------- */
      const dbDetailsStart = performance.now();
      const exerciseDetails = await databaseService.getExercisesByIds(exerciseIds);
      const dbDetailsEnd = performance.now();

      console.log(
        `[Timing] getExercisesByIds took ${(dbDetailsEnd - dbDetailsStart).toFixed(2)} ms`
      );

      /* ---------------- STEP 5: Enrich plan ---------------- */
      const enrichStart = performance.now();
      const enrichedPlan = this.enrichPlanWithDetails(aiPlan, exerciseDetails);
      const enrichEnd = performance.now();

      console.log(
        `[Timing] enrichPlanWithDetails took ${(enrichEnd - enrichStart).toFixed(2)} ms`
      );

      /* ---------------- TOTAL TIME ---------------- */
      const totalEnd = performance.now();
      console.log(
        `[Timing] TOTAL generateWorkout request took ${(totalEnd - totalStart).toFixed(2)} ms`
      );

      res.json({
        success: true,
        data: enrichedPlan,
        generated_at: new Date().toISOString()
      });

    } catch (error) {
      const totalEnd = performance.now();
      console.error(
        `[Timing] FAILED generateWorkout after ${(totalEnd - totalStart).toFixed(2)} ms`
      );
      console.error('Workout generation error:', error);

      res.status(500).json({
        error: 'Failed to generate workout plan',
        details: error.message
      });
    }
  }

  extractExerciseIds(plan) {
    const ids = new Set();
    plan.plan.forEach(day => {
      day.exercises.forEach(ex => {
        ids.add(ex.exercise_id);
      });
    });
    return Array.from(ids);
  }

  enrichPlanWithDetails(aiPlan, exerciseDetails) {
    const detailsMap = {};
    exerciseDetails.forEach(ex => {
      detailsMap[ex.id] = ex;
    });

    return {
      ...aiPlan,
      plan: aiPlan.plan.map(day => ({
        ...day,
        exercises: day.exercises.map(ex => ({
          ...ex,
          details: detailsMap[ex.exercise_id] || null
        }))
      }))
    };
  }

  async getExerciseById(req, res) {
    const start = performance.now();

    try {
      const { id } = req.params;
      const exercises = await databaseService.getExercisesByIds([id]);

      if (!exercises.length) {
        return res.status(404).json({ error: 'Exercise not found' });
      }

      res.json(exercises[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    } finally {
      const end = performance.now();
      console.log(
        `[Timing] getExerciseById took ${(end - start).toFixed(2)} ms`
      );
    }
  }
}

module.exports = new WorkoutController();