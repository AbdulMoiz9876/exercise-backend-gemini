class PromptBuilder {
  /**
   * Build the complete prompt for Gemini AI
   * @param {string} targetMuscle - The muscle group to target
   * @param {number} durationMinutes - Minutes per workout session
   * @param {Array} exercises - List of available exercises from database
   * @returns {string} - Formatted prompt for Gemini
   */
  buildWorkoutPrompt(targetMuscle, durationMinutes, exercises) {
    // Format exercises list for Gemini
    const exercisesList = exercises.map(ex =>
      `- ID: ${ex.id}, Name: "${ex.name}" (Targets: ${ex.target || ex.bodypart})`
    ).join('\n');

    return `
You are a professional fitness trainer. Create a 7-day workout plan based on these requirements:

TARGET MUSCLE: ${targetMuscle}
DAILY WORKOUT DURATION: ${durationMinutes} minutes per day

AVAILABLE EXERCISES (use ONLY these exercise IDs and names):
${exercisesList}

INSTRUCTIONS:
1. Create a 7-day workout plan (Monday to Sunday)
2. Each day must include 4-6 exercises
3. ONLY use exercises from the provided list
4. For each exercise, specify:
   - exercise_id (from the list)
   - exercise_name (from the list)
   - sets (number of sets, 3-5)
   - reps (string, either number of reps like "12-15" or duration like "30 seconds")
   - rest_seconds (number, 30-90 seconds)
5. Ensure variety across the week
6. Include progressive overload (increase intensity through the week)

RESPONSE FORMAT (STRICT JSON ONLY, no other text):
{
  "plan": [
    {
      "day": 1,
      "day_name": "Monday",
      "exercises": [
        {
          "exercise_id": "0001",
          "exercise_name": "3/4 sit-up",
          "sets": 3,
          "reps": "15",
          "rest_seconds": 45
        }
      ]
    }
  ],
  "total_weekly_minutes": ${durationMinutes * 7},
  "target_muscle": "${targetMuscle}"
}

Return ONLY the JSON object, no other text.
`;
  }

  /**
   * Alternative prompt builder with more customization options
   * @param {Object} options - Configuration options
   * @returns {string} - Customized prompt
   */
  buildCustomPrompt(options) {
    const {
      targetMuscle,
      durationMinutes,
      exercises,
      daysPerWeek = 7,
      experienceLevel = 'beginner', // beginner, intermediate, advanced
      equipment = [] // available equipment
    } = options;

    // Filter exercises by equipment if specified
    let filteredExercises = exercises;
    if (equipment.length > 0) {
      filteredExercises = exercises.filter(ex =>
        equipment.includes(ex.equipment) || ex.equipment === 'body weight'
      );
    }

    const exercisesList = filteredExercises.map(ex =>
      `- ID: ${ex.id}, Name: "${ex.name}" (Equipment: ${ex.equipment})`
    ).join('\n');

    return `
You are a professional fitness trainer. Create a ${daysPerWeek}-day workout plan for a ${experienceLevel} level person.

TARGET MUSCLE: ${targetMuscle}
DAILY WORKOUT DURATION: ${durationMinutes} minutes per day
AVAILABLE EQUIPMENT: ${equipment.join(', ') || 'body weight only'}

AVAILABLE EXERCISES (use ONLY these):
${exercisesList}

INSTRUCTIONS:
1. Create a ${daysPerWeek}-day workout plan
2. Each day must include 4-6 exercises
3. ONLY use exercises from the provided list
4. For each exercise, specify:
   - exercise_id, exercise_name, sets, reps, rest_seconds
5. Ensure variety and appropriate intensity for ${experienceLevel} level

RESPONSE FORMAT (STRICT JSON ONLY):
{
  "plan": [
    {
      "day": 1,
      "day_name": "Monday",
      "exercises": [
        {
          "exercise_id": "0001",
          "exercise_name": "3/4 sit-up",
          "sets": 3,
          "reps": "15",
          "rest_seconds": 45
        }
      ]
    }
  ]
}
`;
  }
}

module.exports = new PromptBuilder();