const express = require('express');
const router = express.Router();
const pool = require('../db'); // 引入数据库连接池

// 获取某个电影的所有评论
router.get('/:movie_id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id = u.id WHERE c.movie_id = ? ORDER BY c.created_at DESC',
      [req.params.movie_id]
    );
    res.json(rows);
  } catch (error) {
    console.error('获取评论失败:', error);
    res.status(500).json({ error: '获取评论失败' });
  }
});

// 获取电影的评论数量
router.get('/count/:movieId', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM comments WHERE movie_id = ?',
      [req.params.movieId]
    );
    res.json({ count: rows[0].count });
  } catch (error) {
    console.error('获取评论数量失败:', error);
    res.status(500).json({ error: '获取评论数量失败' });
  }
});

// 提交新的评论
router.post('/', async (req, res) => {
  const { movie_id, user_id, comment_text } = req.body; // 假设请求体中包含 movie_id, user_id, comment_text

  // 简单的输入验证
  if (!movie_id || !user_id || !comment_text) {
    return res.status(400).json({ error: '缺少必要的评论信息' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO comments (movie_id, user_id, comment_text) VALUES (?, ?, ?)',
      [movie_id, user_id, comment_text]
    );
    res.status(201).json({ message: '评论发表成功', comment_id: result.insertId });
  } catch (error) {
    console.error('发表评论失败:', error);
    res.status(500).json({ error: '发表评论失败' });
  }
});

module.exports = router;