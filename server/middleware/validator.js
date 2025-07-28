// 用户注册验证
const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: '用户名、邮箱和密码为必填项' });
  }

  // 邮箱格式验证
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: '请输入有效的邮箱地址' });
  }

  // 密码长度验证
  if (password.length < 6) {
    return res.status(400).json({ error: '密码长度不能少于6位' });
  }

  next();
};

// 用户登录验证
const validateLogin = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码为必填项' });
  }

  next();
};

// 评论验证
const validateComment = (req, res, next) => {
  const { movie_id, user_id, comment_text } = req.body;

  if (!movie_id || !user_id || !comment_text) {
    return res.status(400).json({ error: '电影ID、用户ID和评论内容为必填项' });
  }

  if (comment_text.length < 1 || comment_text.length > 500) {
    return res.status(400).json({ error: '评论内容长度应在1-500字之间' });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateComment
}; 