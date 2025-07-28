const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movie.controller');
const { verifyToken } = require('../middleware/auth');

// 获取所有电影
router.get('/', movieController.getAllMovies);

// 搜索电影
router.get('/search', movieController.searchMovies);

// 获取单个电影详情
router.get('/:id', movieController.getMovieById);

// 更新电影评分（需要认证）
router.put('/:movieId/rating', verifyToken, movieController.updateMovieRating);

// 获取用户对电影的评分状态
router.get('/:movieId/user-rating/:userId', verifyToken, movieController.getUserRating);

// 用户对电影进行评分
router.post('/:movieId/rate', verifyToken, movieController.rateMovie);

module.exports = router; 