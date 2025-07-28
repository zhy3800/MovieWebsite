# 🎬 电影网站项目

一个功能完整的电影网站，包含电影浏览、搜索、收藏、评论、评分等功能。

## ✨ 功能特性

- 🎥 电影浏览和搜索
- ❤️ 用户收藏系统
- 💬 评论功能
- ⭐ 评分系统
- 🔐 用户注册/登录
- 📱 响应式设计
- 🎨 现代化 UI 界面

## 🛠️ 技术栈

### 前端
- **Next.js** - React 框架
- **Tailwind CSS** - 样式框架
- **Axios** - HTTP 客户端
- **Font Awesome** - 图标库

### 后端
- **Node.js** - 运行环境
- **Express.js** - Web 框架
- **MySQL** - 数据库
- **JWT** - 身份验证

## 🚀 快速开始

### 本地开发

1. **克隆项目**
   ```bash
   git clone <你的仓库地址>
   cd MovieWebsite
   ```

2. **安装依赖**
   ```bash
   # 安装后端依赖
   cd server
   npm install
   
   # 安装前端依赖
   cd ../client
   npm install
   ```

3. **配置数据库**
   - 确保你的 MySQL 数据库正在运行
   - 导入 `server/db/init.sql` 文件到数据库
   - 修改 `server/db.js` 中的数据库连接配置

4. **启动服务**
   ```bash
   # 启动后端服务 (端口 5000)
   cd server
   npm start
   
   # 新开终端，启动前端服务 (端口 3000)
   cd client
   npm run dev
   ```

5. **访问应用**
   - 前端: http://localhost:3000
   - 后端 API: http://localhost:5000/api

## 🌐 在线部署

要让其他人通过链接直接访问你的项目，请按照以下步骤部署：

### 快速部署

运行部署脚本：
```bash
chmod +x deploy.sh
./deploy.sh
```

### 手动部署

详细部署步骤请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

**部署后，你可以将前端链接分享给任何人，他们都能直接使用你的电影网站！**

## 📁 项目结构

```
MovieWebsite/
├── client/                 # 前端代码 (Next.js)
│   ├── components/        # React 组件
│   ├── pages/            # 页面文件
│   ├── styles/           # 样式文件
│   └── utils/            # 工具函数
├── server/               # 后端代码 (Express.js)
│   ├── controllers/      # 控制器
│   ├── routes/          # 路由
│   ├── models/          # 数据模型
│   ├── middleware/      # 中间件
│   └── db/              # 数据库相关
├── DEPLOYMENT.md        # 部署指南
└── deploy.sh           # 部署脚本
```

## 🔧 环境变量

### 前端 (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 后端
```
NODE_ENV=development
PORT=5000
```

## 📝 API 接口

### 用户相关
- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录

### 电影相关
- `GET /api/movies` - 获取电影列表
- `GET /api/movies/:id` - 获取电影详情
- `GET /api/search` - 搜索电影

### 收藏相关
- `GET /api/favorites/:userId` - 获取用户收藏
- `POST /api/favorites` - 添加收藏
- `DELETE /api/favorites/:userId/:movieId` - 取消收藏

### 评论相关
- `GET /api/comments/:movieId` - 获取电影评论
- `POST /api/comments` - 发表评论

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🆘 支持

如果遇到问题，请：
1. 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 中的故障排除部分
2. 检查控制台错误信息
3. 确保数据库配置正确
4. 确保所有依赖都已正确安装

---

**享受你的电影网站！** 🎬✨ 