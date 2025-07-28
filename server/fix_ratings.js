const pool = require('./db');

async function fixRatings() {
  const connection = await pool.getConnection();
  try {
    console.log('开始检查评分功能...');
    
    // 1. 检查ratings表是否存在
    const [tables] = await connection.query('SHOW TABLES LIKE "ratings"');
    if (tables.length === 0) {
      console.log('创建ratings表...');
      await connection.query(`
        CREATE TABLE IF NOT EXISTS ratings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          movie_id INT NOT NULL,
          user_id INT NOT NULL,
          rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY unique_rating (user_id, movie_id)
        )
      `);
    }
    
    // 2. 检查movies表中的rating列
    console.log('检查movies表的rating列...');
    const [columns] = await connection.query('SHOW COLUMNS FROM movies');
    const hasRating = columns.some(col => col.Field === 'rating');
    
    if (!hasRating) {
      console.log('添加rating列到movies表...');
      await connection.query('ALTER TABLE movies ADD COLUMN rating DECIMAL(3,1) DEFAULT NULL');
    }
    
    // 3. 更新所有电影的平均评分
    console.log('更新所有电影的平均评分...');
    await connection.query(`
      UPDATE movies m
      LEFT JOIN (
        SELECT movie_id, AVG(rating) as avg_rating
        FROM ratings
        GROUP BY movie_id
      ) r ON m.id = r.movie_id
      SET m.rating = r.avg_rating
    `);
    
    // 4. 检查并修复触发器
    console.log('检查并修复触发器...');
    
    // 删除旧的触发器
    await connection.query('DROP TRIGGER IF EXISTS update_movie_on_rating');
    await connection.query('DROP TRIGGER IF EXISTS update_movie_on_rating_update');
    
    // 创建新的触发器
    await connection.query(`
      CREATE TRIGGER update_movie_on_rating
      AFTER INSERT ON ratings
      FOR EACH ROW
      BEGIN
          UPDATE movies
          SET rating = (
              SELECT AVG(rating) FROM ratings WHERE movie_id = NEW.movie_id
          )
          WHERE id = NEW.movie_id;
      END
    `);
    
    await connection.query(`
      CREATE TRIGGER update_movie_on_rating_update
      AFTER UPDATE ON ratings
      FOR EACH ROW
      BEGIN
          UPDATE movies
          SET rating = (
              SELECT AVG(rating) FROM ratings WHERE movie_id = NEW.movie_id
          )
          WHERE id = NEW.movie_id;
      END
    `);
    
    console.log('评分功能修复完成！');
  } catch (error) {
    console.error('修复评分功能时出错:', error);
  } finally {
    connection.release();
    process.exit();
  }
}

fixRatings(); 