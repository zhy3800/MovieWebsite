// models/movie.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'movie_db'
});

class Movie {
  static async getAll() {
    const [rows] = await pool.execute('SELECT * FROM movies');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM movies WHERE id = ?', [id]);
    return rows[0];
  }
}

module.exports = Movie;
    