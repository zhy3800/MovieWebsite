const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const userRoutes = require('./routes/users');
const pool = require('./db');// 引入数据库连接池
const commentsRoutes = require('./routes/comments'); // 引入评论路由
const favoritesRoutes = require('./routes/favorites'); // 引入收藏路由
const moviesRoutes = require('./routes/movies'); // 引入电影路由
const searchRoutes = require('./routes/search'); // 引入搜索路由
const errorHandler = require('./middleware/error-handler');

const app = express();

// 中间件 - 明确配置 cors 以允许 Content-Type 请求头
app.use(cors({
  origin: '*', // 允许所有来源，你也可以指定你的前端源 'http://localhost:3000'
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // 允许的 HTTP 方法
  allowedHeaders: ['Content-Type', 'Authorization'] // 允许的请求头
}));

//解析 JSON 请求体
app.use(express.json());

// 用户路由现在 userRoutes 模块会通过 require('../db') 获取、 db.js 中导出的 pool
app.use('/api/users', userRoutes);
// 评论路由
app.use('/api/comments', commentsRoutes);
// 收藏路由
app.use('/api/favorites', favoritesRoutes);
// 电影路由
app.use('/api/movies', moviesRoutes);
// 搜索路由
app.use('/api/search', searchRoutes);

// 根路由 - 处理健康检查
app.get('/', (req, res) => {
  res.json({ 
    message: 'MovieWebsite API Server is running!', 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API状态检查路由
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'API is working properly',
    timestamp: new Date().toISOString()
  });
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器（使用不同端口，避免与Next.js冲突）
const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`服务器运行在端口 ${PORT}`);
});