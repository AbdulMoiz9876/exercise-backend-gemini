const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();
class DatabaseService {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.NEON_CONNECTION_STRING,
    });
  }

  // Get all exercises for reference
  async getAllExercises() {
    const query = 'SELECT id, name, bodypart, target, equipment FROM exercises';
    const result = await this.pool.query(query);
    return result.rows;
  }

  // Get specific exercises by IDs
  async getExercisesByIds(ids) {
    const query = `
      SELECT 
        id, 
        name, 
        bodypart, 
        equipment, 
        target, 
        othermuscleslist, 
        instructionslist, 
        gifurl, 
        gifid 
      FROM exercises 
      WHERE id = ANY($1::text[])
    `;
    const result = await this.pool.query(query, [ids]);
    return result.rows;
  }

  // Get exercises by target muscle
  async getExercisesByTarget(target) {
    const query = `
      SELECT id, name FROM exercises 
      WHERE target ILIKE $1 OR bodypart ILIKE $1
    `;
    const result = await this.pool.query(query, [`%${target}%`]);
    return result.rows;
  }
}

module.exports = new DatabaseService();