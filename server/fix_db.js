const pool = require('./db');

async function fixDatabase() {
  const connection = await pool.getConnection();
  try {
    console.log('开始修复数据库...');
    
    // 1. 检查movies表是否有popularity列
    console.log('检查movies表结构...');
    const [columns] = await connection.query('SHOW COLUMNS FROM movies');
    const hasPopularity = columns.some(col => col.Field === 'popularity');
    
    if (!hasPopularity) {
      console.log('添加popularity列到movies表...');
      await connection.query('ALTER TABLE movies ADD COLUMN popularity DECIMAL(10,2) DEFAULT 0');
    } else {
      console.log('popularity列已存在');
    }
    
    // 2. 删除所有触发器
    console.log('删除现有触发器...');
    await connection.query('DROP TRIGGER IF EXISTS update_movie_popularity_on_favorite');
    await connection.query('DROP TRIGGER IF EXISTS update_movie_popularity_on_comment');
    await connection.query('DROP TRIGGER IF EXISTS update_movie_on_rating');
    await connection.query('DROP TRIGGER IF EXISTS update_movie_on_rating_update');
    await connection.query('DROP TRIGGER IF EXISTS update_movie_popularity_on_unfavorite');
    
    // 3. 创建新的触发器
    console.log('创建新的触发器...');
    
    // 收藏触发器
    await connection.query(`
      CREATE TRIGGER update_movie_popularity_on_favorite
      AFTER INSERT ON favorites
      FOR EACH ROW
      BEGIN
          UPDATE movies
          SET popularity = (
              (SELECT COUNT(*) FROM favorites WHERE movie_id = NEW.movie_id) * 0.4 +
              (SELECT COUNT(*) FROM comments WHERE movie_id = NEW.movie_id) * 0.3 +
              (SELECT COUNT(*) FROM ratings WHERE movie_id = NEW.movie_id) * 0.3
          )
          WHERE id = NEW.movie_id;
      END
    `);
    
    // 取消收藏触发器
    await connection.query(`
      CREATE TRIGGER update_movie_popularity_on_unfavorite
      AFTER DELETE ON favorites
      FOR EACH ROW
      BEGIN
          UPDATE movies
          SET popularity = (
              (SELECT COUNT(*) FROM favorites WHERE movie_id = OLD.movie_id) * 0.4 +
              (SELECT COUNT(*) FROM comments WHERE movie_id = OLD.movie_id) * 0.3 +
              (SELECT COUNT(*) FROM ratings WHERE movie_id = OLD.movie_id) * 0.3
          )
          WHERE id = OLD.movie_id;
      END
    `);
    
    // 评论触发器
    await connection.query(`
      CREATE TRIGGER update_movie_popularity_on_comment
      AFTER INSERT ON comments
      FOR EACH ROW
      BEGIN
          UPDATE movies
          SET popularity = (
              (SELECT COUNT(*) FROM favorites WHERE movie_id = NEW.movie_id) * 0.4 +
              (SELECT COUNT(*) FROM comments WHERE movie_id = NEW.movie_id) * 0.3 +
              (SELECT COUNT(*) FROM ratings WHERE movie_id = NEW.movie_id) * 0.3
          )
          WHERE id = NEW.movie_id;
      END
    `);
    
    // 评分触发器
    await connection.query(`
      CREATE TRIGGER update_movie_on_rating
      AFTER INSERT ON ratings
      FOR EACH ROW
      BEGIN
          UPDATE movies
          SET popularity = (
              (SELECT COUNT(*) FROM favorites WHERE movie_id = NEW.movie_id) * 0.4 +
              (SELECT COUNT(*) FROM comments WHERE movie_id = NEW.movie_id) * 0.3 +
              (SELECT COUNT(*) FROM ratings WHERE movie_id = NEW.movie_id) * 0.3
          ),
          rating = (
              SELECT AVG(rating) FROM ratings WHERE movie_id = NEW.movie_id
          )
          WHERE id = NEW.movie_id;
      END
    `);
    
    // 评分更新触发器
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
    
    console.log('数据库修复完成！');
  } catch (error) {
    console.error('修复数据库时出错:', error);
  } finally {
    connection.release();
    process.exit();
  }
}

fixDatabase(); 