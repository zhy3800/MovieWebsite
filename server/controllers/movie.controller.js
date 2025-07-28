const movieService = require('../services/movie.service');

class MovieController {
  async getMovieById(req, res) {
    try {
      const { id } = req.params;
      const movie = await movieService.findById(id);
      
      if (!movie) {
        return res.status(404).json({ error: '电影不存在' });
      }
      
      res.json(movie);
    } catch (error) {
      console.error('获取电影详情失败:', error);
      res.status(500).json({ error: '获取电影详情失败' });
    }
  }

  async getAllMovies(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;
      const offset = (page - 1) * limit;
      
      const result = await movieService.findAll(limit, offset);
      res.json(result);
    } catch (error) {
      console.error('获取电影列表失败:', error);
      res.status(500).json({ error: '获取电影列表失败' });
    }
  }

  async searchMovies(req, res) {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ error: '搜索关键词不能为空' });
      }
      
      const movies = await movieService.search(query);
      res.json(movies);
    } catch (error) {
      console.error('搜索电影失败:', error);
      res.status(500).json({ error: '搜索电影失败' });
    }
  }

  async updateMovieRating(req, res) {
    try {
      const { movieId } = req.params;
      const avgRating = await movieService.updateRating(movieId);
      res.json({ rating: avgRating });
    } catch (error) {
      console.error('更新电影评分失败:', error);
      res.status(500).json({ error: '更新电影评分失败' });
    }
  }
  
  async getUserRating(req, res) {
    try {
      const { movieId, userId } = req.params;
      const rating = await movieService.getUserRating(movieId, userId);
      res.json(rating);
    } catch (error) {
      console.error('获取用户评分状态失败:', error);
      res.status(500).json({ error: '获取用户评分状态失败' });
    }
  }
  
  async rateMovie(req, res) {
    try {
      const { movieId } = req.params;
      const { user_id, rating } = req.body;
      
      if (!user_id || !rating) {
        return res.status(400).json({ error: '缺少必要的评分信息' });
      }
      
      await movieService.rateMovie(movieId, user_id, rating);
      res.status(201).json({ message: '评分成功' });
    } catch (error) {
      console.error('评分失败:', error);
      res.status(500).json({ error: '评分失败' });
    }
  }
}

module.exports = new MovieController(); 