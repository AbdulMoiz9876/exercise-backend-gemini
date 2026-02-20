const { GoogleGenerativeAI } = require('@google/generative-ai');
const promptBuilder = require('../utils/promptBuilder'); // Add this line
const dotenv = require('dotenv');
dotenv.config();

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async generateWorkoutPlan(targetMuscle, durationMinutes, availableExercises) {
    // Use the prompt builder instead of building prompt here
    const prompt = promptBuilder.buildWorkoutPrompt(targetMuscle, durationMinutes, availableExercises);

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the JSON response from Gemini
      return this.parseGeminiResponse(text);
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate workout plan');
    }
  }

  parseGeminiResponse(text) {
    try {
      // Clean the response (remove markdown code blocks if present)
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      throw new Error('Invalid response format from AI');
    }
  }
}

module.exports = new GeminiService();