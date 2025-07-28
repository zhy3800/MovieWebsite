const jwt = require('jsonwebtoken');
const userService = require('../services/user.service');

class UserController {
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      // 检查邮箱是否已被注册
      const existingUser = await userService.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: '该邮箱已被注册' });
      }

      // 创建新用户
      await userService.create(username, email, password);
      res.status(201).json({ message: '注册成功' });
    } catch (error) {
      console.error('注册失败:', error);
      res.status(500).json({ error: '注册失败' });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;

      // 查找用户
      const user = await userService.findByUsername(username);
      if (!user) {
        return res.status(401).json({ error: '用户不存在' });
      }

      // 验证密码
      const isValidPassword = await userService.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: '密码错误' });
      }

      // 生成 JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error('登录失败:', error);
      res.status(500).json({ error: '登录失败' });
    }
  }
}

module.exports = new UserController(); 