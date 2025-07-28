const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // 处理特定类型的错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: '验证错误',
      details: err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: '未授权',
      details: err.message
    });
  }

  // 默认错误响应
  res.status(500).json({
    error: '服务器内部错误',
    details: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
  });
};

module.exports = errorHandler; 