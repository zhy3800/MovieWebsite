-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建电影表
CREATE TABLE IF NOT EXISTS movies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  zhy_title VARCHAR(255),
  description TEXT,
  poster_path VARCHAR(255),
  backdrop_path VARCHAR(255),
  release_date DATE,
  rating DECIMAL(3,1),
  director VARCHAR(100),
  cast TEXT,
  genres VARCHAR(255),
  runtime INT,
  popularity DECIMAL(10,2) DEFAULT 0,  -- 添加热度字段
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建评分表
CREATE TABLE IF NOT EXISTS ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  movie_id INT NOT NULL,
  user_id INT NOT NULL,
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_rating (user_id, movie_id)
);

-- 创建评论表
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  movie_id INT NOT NULL,
  user_id INT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  movie_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (user_id, movie_id)
);

-- 创建收藏历史记录表
CREATE TABLE IF NOT EXISTS favorite_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  movie_id INT NOT NULL,
  action ENUM('add', 'remove') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

-- 新建触发器：当有新的收藏时更新热度
DELIMITER //
CREATE TRIGGER update_movie_popularity_on_favorite
AFTER INSERT ON favorites
FOR EACH ROW
BEGIN
    UPDATE movies m
    SET m.popularity = (
        (SELECT COUNT(*) FROM favorites WHERE movie_id = NEW.movie_id) * 0.4 +
        (SELECT COUNT(*) FROM comments WHERE movie_id = NEW.movie_id) * 0.3 +
        (SELECT COUNT(*) FROM ratings WHERE movie_id = NEW.movie_id) * 0.3
    )
    WHERE m.id = NEW.movie_id;
END //
DELIMITER ;

-- 新建触发器：当有新的评论时更新热度
DELIMITER //
CREATE TRIGGER update_movie_popularity_on_comment
AFTER INSERT ON comments
FOR EACH ROW
BEGIN
    UPDATE movies m
    SET m.popularity = (
        (SELECT COUNT(*) FROM favorites WHERE movie_id = NEW.movie_id) * 0.4 +
        (SELECT COUNT(*) FROM comments WHERE movie_id = NEW.movie_id) * 0.3 +
        (SELECT COUNT(*) FROM ratings WHERE movie_id = NEW.movie_id) * 0.3
    )
    WHERE m.id = NEW.movie_id;
END //
DELIMITER ;

-- 新建触发器：当有新的评分时更新热度和评分
DELIMITER //
CREATE TRIGGER update_movie_on_rating
AFTER INSERT ON ratings
FOR EACH ROW
BEGIN
    -- 更新电影热度
    UPDATE movies m
    SET m.popularity = (
        (SELECT COUNT(*) FROM favorites WHERE movie_id = NEW.movie_id) * 0.4 +
        (SELECT COUNT(*) FROM comments WHERE movie_id = NEW.movie_id) * 0.3 +
        (SELECT COUNT(*) FROM ratings WHERE movie_id = NEW.movie_id) * 0.3
    )
    WHERE m.id = NEW.movie_id;
    
    -- 更新电影平均评分
    UPDATE movies m
    SET m.rating = (
        SELECT AVG(rating) FROM ratings WHERE movie_id = NEW.movie_id
    )
    WHERE m.id = NEW.movie_id;
END //
DELIMITER ;

-- 新建触发器：当评分更新时更新电影评分
DELIMITER //
CREATE TRIGGER update_movie_on_rating_update
AFTER UPDATE ON ratings
FOR EACH ROW
BEGIN
    -- 更新电影平均评分
    UPDATE movies m
    SET m.rating = (
        SELECT AVG(rating) FROM ratings WHERE movie_id = NEW.movie_id
    )
    WHERE m.id = NEW.movie_id;
END //
DELIMITER ;

