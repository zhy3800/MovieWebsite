const express = require('express');
const router = express.Router();
const pool = require('../db');

// 获取用户的当前收藏列表
router.get('/user/:userId', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT f.*, m.* 
       FROM favorites f 
       JOIN movies m ON f.movie_id = m.id 
       WHERE f.user_id = ?`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    res.status(500).json({ error: '获取收藏列表失败' });
  }
});

// 获取用户的收藏历史记录
router.get('/history/:userId', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT fh.*, m.zhy_title, m.poster_path, m.rating, m.release_date 
       FROM favorite_history fh 
       JOIN movies m ON fh.movie_id = m.id 
       WHERE fh.user_id = ? 
       ORDER BY fh.created_at DESC`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('获取收藏历史失败:', error);
    res.status(500).json({ error: '获取收藏历史失败' });
  }
});

// 添加收藏
router.post('/', async (req, res) => {
  const { user_id, movie_id } = req.body;

  if (!user_id || !movie_id) {
    return res.status(400).json({ error: '缺少必要的收藏信息' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 检查是否已经收藏
    const [existing] = await connection.execute(
      'SELECT * FROM favorites WHERE user_id = ? AND movie_id = ?',
      [user_id, movie_id]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: '已经收藏过该电影' });
    }

    // 添加收藏
    await connection.execute(
      'INSERT INTO favorites (user_id, movie_id) VALUES (?, ?)',
      [user_id, movie_id]
    );

    // 记录收藏历史
    await connection.execute(
      'INSERT INTO favorite_history (user_id, movie_id, action) VALUES (?, ?, ?)',
      [user_id, movie_id, 'add']
    );

    await connection.commit();
    res.status(201).json({ message: '收藏成功' });
  } catch (error) {
    await connection.rollback();
    console.error('添加收藏失败:', error);
    res.status(500).json({ error: '添加收藏失败' });
  } finally {
    connection.release();
  }
});

// 取消收藏
router.delete('/:userId/:movieId', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 检查是否存在收藏
    const [existing] = await connection.execute(
      'SELECT * FROM favorites WHERE user_id = ? AND movie_id = ?',
      [req.params.userId, req.params.movieId]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: '未找到收藏记录' });
    }

    // 删除收藏
    await connection.execute(
      'DELETE FROM favorites WHERE user_id = ? AND movie_id = ?',
      [req.params.userId, req.params.movieId]
    );

    // 记录取消收藏历史
    await connection.execute(
      'INSERT INTO favorite_history (user_id, movie_id, action) VALUES (?, ?, ?)',
      [req.params.userId, req.params.movieId, 'remove']
    );

    await connection.commit();
    res.json({ message: '取消收藏成功' });
  } catch (error) {
    await connection.rollback();
    console.error('取消收藏失败:', error);
    res.status(500).json({ error: '取消收藏失败' });
  } finally {
    connection.release();
  }
});

// 检查是否已收藏
router.get('/check/:userId/:movieId', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM favorites WHERE user_id = ? AND movie_id = ?',
      [req.params.userId, req.params.movieId]
    );
    res.json({ isFavorited: rows.length > 0 });
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    res.status(500).json({ error: '检查收藏状态失败' });
  }
});

// 获取电影的收藏数量
router.get('/count/:movieId', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM favorites WHERE movie_id = ?',
      [req.params.movieId]
    );
    res.json({ count: rows[0].count });
  } catch (error) {
    console.error('获取收藏数量失败:', error);
    res.status(500).json({ error: '获取收藏数量失败' });
  }
});

module.exports = router; 