const pool = require('../db');

class MovieService {
  async findById(id) {
    const [movies] = await pool.execute(
      'SELECT * FROM movies WHERE id = ?',
      [id]
    );
    return movies[0];
  }

  async findAll(limit = 10, offset = 0) {
    // 确保参数是整数并防止 SQL 注入
    limit = parseInt(limit);
    offset = parseInt(offset);
    
    if (isNaN(limit) || isNaN(offset) || limit < 0 || offset < 0) {
      throw new Error('Invalid limit or offset parameters');
    }
    
    // 获取总数
    const [totalRows] = await pool.execute('SELECT COUNT(*) as total FROM movies');
    const total = totalRows[0].total;
    
    // 获取分页数据
    const [movies] = await pool.execute(
      `SELECT * FROM movies LIMIT ${limit} OFFSET ${offset}`
    );
    
    return {
      movies,
      total
    };
  }

  async search(query) {
    const searchTerm = `%${query}%`;
    const [movies] = await pool.execute(
      'SELECT * FROM movies WHERE zhy_title LIKE ? OR eng_title LIKE ? OR description LIKE ?',
      [searchTerm, searchTerm, searchTerm]
    );
    return movies;
  }

  async updateRating(movieId) {
    // 计算平均评分
    const [ratings] = await pool.execute(
      'SELECT AVG(rating) as avg_rating FROM ratings WHERE movie_id = ?',
      [movieId]
    );
    
    const avgRating = ratings[0].avg_rating || 0;
    
    // 更新电影评分
    await pool.execute(
      'UPDATE movies SET rating = ? WHERE id = ?',
      [avgRating, movieId]
    );
    
    return avgRating;
  }

  async getUserRating(movieId, userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM ratings WHERE movie_id = ? AND user_id = ?',
      [movieId, userId]
    );
    
    if (rows.length === 0) {
      return { rated: false, rating: 0 };
    }
    
    return { rated: true, rating: rows[0].rating };
  }
  
  async rateMovie(movieId, userId, rating) {
    // 确保评分在 1-5 之间
    rating = Math.min(5, Math.max(1, Number(rating)));
    
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // 检查用户是否已经评过分
      const [existing] = await connection.execute(
        'SELECT * FROM ratings WHERE movie_id = ? AND user_id = ?',
        [movieId, userId]
      );
      
      if (existing.length > 0) {
        // 更新已有评分
        await connection.execute(
          'UPDATE ratings SET rating = ? WHERE movie_id = ? AND user_id = ?',
          [rating, movieId, userId]
        );
      } else {
        // 添加新评分
        await connection.execute(
          'INSERT INTO ratings (movie_id, user_id, rating) VALUES (?, ?, ?)',
          [movieId, userId, rating]
        );
      }
      
      // 更新电影的平均评分
      const [ratings] = await connection.execute(
        'SELECT AVG(rating) as avg_rating FROM ratings WHERE movie_id = ?',
        [movieId]
      );
      
      const avgRating = ratings[0].avg_rating || 0;
      
      await connection.execute(
        'UPDATE movies SET rating = ? WHERE id = ?',
        [avgRating, movieId]
      );
      
      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new MovieService(); 