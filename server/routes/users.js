const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { validateRegister, validateLogin } = require('../middleware/validator');

// 用户注册
router.post('/register', validateRegister, userController.register);

// 用户登录
router.post('/login', validateLogin, userController.login);

module.exports = router;