# 项目部署指南

## 概述
本指南将帮助你把这个电影网站项目部署到云端，让其他人可以通过链接直接访问和使用。

## 部署方案
- **前端**: Vercel (免费)
- **后端**: Render (免费)
- **数据库**: 使用你现有的数据库配置

## 步骤一：准备后端部署

### 1. 注册 Render 账号
访问 [Render](https://render.com/) 并注册账号。

### 2. 创建 Web Service
1. 点击 "New" → "Web Service"
2. 连接你的 GitHub 仓库
3. 配置服务：
   - **Name**: `movie-website-backend` (或你喜欢的名字)
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

### 3. 配置环境变量
在 Render 控制台添加以下环境变量：
```
NODE_ENV=production
PORT=10000
```

### 4. 部署
点击 "Create Web Service"，等待部署完成。
部署完成后，你会得到一个类似 `https://your-app-name.onrender.com` 的地址。

## 步骤二：准备前端部署

### 1. 注册 Vercel 账号
访问 [Vercel](https://vercel.com/) 并注册账号。

### 2. 导入项目
1. 点击 "New Project"
2. 导入你的 GitHub 仓库
3. 配置项目：
   - **Framework Preset**: Next.js
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. 配置环境变量
在 Vercel 控制台添加环境变量：
```
NEXT_PUBLIC_API_URL=https://your-app-name.onrender.com/api
```
(将 `your-app-name` 替换为你实际的 Render 应用名称)

### 4. 部署
点击 "Deploy"，等待部署完成。
部署完成后，你会得到一个类似 `https://your-movie-website.vercel.app` 的地址。

## 步骤三：测试部署

1. 访问你的 Vercel 前端地址
2. 测试以下功能：
   - 浏览电影列表
   - 搜索电影
   - 注册/登录
   - 收藏电影
   - 评论功能
   - 评分功能

## 步骤四：分享给他人

现在你可以将前端地址分享给其他人：
```
https://your-movie-website.vercel.app
```

他们只需要点击这个链接就能直接使用你的电影网站，无需安装任何软件或配置数据库。

## 注意事项

### 1. 数据库配置
- 确保你的后端数据库配置正确
- 如果使用远程数据库，确保连接字符串正确
- 如果使用本地数据库，需要确保数据库服务正在运行

### 2. CORS 配置
确保你的后端允许来自 Vercel 域名的跨域请求。

### 3. 环境变量
- 不要在前端代码中硬编码 API 地址
- 使用环境变量来配置不同环境的 API 地址

### 4. 免费服务限制
- Render 免费服务在 15 分钟无活动后会休眠
- Vercel 免费服务有带宽和构建时间限制
- 如果项目受欢迎，考虑升级到付费计划

## 故障排除

### 1. 前端无法连接后端
- 检查 `NEXT_PUBLIC_API_URL` 环境变量是否正确
- 确认后端服务正在运行
- 检查 CORS 配置

### 2. 数据库连接失败
- 检查数据库连接字符串
- 确认数据库服务正在运行
- 检查防火墙设置

### 3. 部署失败
- 检查构建日志中的错误信息
- 确认所有依赖都已正确安装
- 检查 Node.js 版本兼容性

## 更新部署

当你修改代码后：
1. 推送到 GitHub
2. Vercel 和 Render 会自动重新部署
3. 通常几分钟内就能看到更新

## 监控和维护

- 定期检查服务状态
- 监控错误日志
- 备份重要数据
- 及时更新依赖包

---

部署完成后，你就可以将前端链接分享给任何人，他们都能直接使用你的电影网站了！ 