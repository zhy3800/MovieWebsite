-- 首先删除现有的触发器
DROP TRIGGER IF EXISTS update_movie_popularity_on_favorite;
DROP TRIGGER IF EXISTS update_movie_popularity_on_comment;
DROP TRIGGER IF EXISTS update_movie_on_rating;
DROP TRIGGER IF EXISTS update_movie_on_rating_update;
DROP TRIGGER IF EXISTS update_movie_popularity_on_unfavorite;

-- 重新创建触发器：当有新的收藏时更新热度
DELIMITER //
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
END //
DELIMITER ;

-- 创建触发器：当取消收藏时更新热度
DELIMITER //
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
END //
DELIMITER ;

-- 重新创建触发器：当有新的评论时更新热度
DELIMITER //
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
END //
DELIMITER ;

-- 重新创建触发器：当有新的评分时更新热度和评分
DELIMITER //
CREATE TRIGGER update_movie_on_rating
AFTER INSERT ON ratings
FOR EACH ROW
BEGIN
    -- 更新电影热度
    UPDATE movies
    SET popularity = (
        (SELECT COUNT(*) FROM favorites WHERE movie_id = NEW.movie_id) * 0.4 +
        (SELECT COUNT(*) FROM comments WHERE movie_id = NEW.movie_id) * 0.3 +
        (SELECT COUNT(*) FROM ratings WHERE movie_id = NEW.movie_id) * 0.3
    )
    WHERE id = NEW.movie_id;
    
    -- 更新电影平均评分
    UPDATE movies
    SET rating = (
        SELECT AVG(rating) * 2 FROM ratings WHERE movie_id = NEW.movie_id
    )
    WHERE id = NEW.movie_id;
END //
DELIMITER ;

-- 重新创建触发器：当评分更新时更新电影评分
DELIMITER //
CREATE TRIGGER update_movie_on_rating_update
AFTER UPDATE ON ratings
FOR EACH ROW
BEGIN
    -- 更新电影平均评分
    UPDATE movies
    SET rating = (
        SELECT AVG(rating) * 2 FROM ratings WHERE movie_id = NEW.movie_id
    )
    WHERE id = NEW.movie_id;
END //
DELIMITER ; 