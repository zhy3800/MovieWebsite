const express = require('express');
const router = express.Router();
const pool = require('../db');

// 搜索电影
router.get('/movies', async (req, res) => {
  const { query, page = 1, limit = 12 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  console.log(`搜索请求: 关键词="${query}", 页码=${page}, 每页=${limit}, 偏移=${offset}`);

  try {
    // 首先获取总数
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total 
       FROM movies 
       WHERE LOWER(zhy_title) LIKE LOWER(?) 
       OR LOWER(description) LIKE LOWER(?)`,
      [`%${query}%`, `%${query}%`]
    );
    
    const total = parseInt(countResult[0].total);
    console.log(`搜索结果总数: ${total}`);

    // 然后获取分页结果 - 使用字符串插值处理LIMIT和OFFSET
    const [rows] = await pool.execute(
      `SELECT * 
       FROM movies 
       WHERE LOWER(zhy_title) LIKE LOWER(?) 
       OR LOWER(description) LIKE LOWER(?)
       ORDER BY release_date DESC 
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
      [`%${query}%`, `%${query}%`]
    );

    console.log(`当前页返回结果数: ${rows.length}`);
    const totalPages = Math.ceil(total / parseInt(limit));
    console.log(`计算总页数: ${totalPages}`);

    res.status(200).json({
      movies: rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages
    });
  } catch (error) {
    console.error('搜索电影失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

module.exports = router; 