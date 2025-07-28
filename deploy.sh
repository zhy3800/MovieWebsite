#!/bin/bash

echo "🎬 电影网站部署脚本"
echo "=================="

# 检查是否已安装必要的工具
check_requirements() {
    echo "检查部署要求..."
    
    if ! command -v git &> /dev/null; then
        echo "❌ 请先安装 Git"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo "❌ 请先安装 Node.js"
        exit 1
    fi
    
    echo "✅ 基本要求检查通过"
}

# 检查 Git 仓库状态
check_git_status() {
    echo "检查 Git 仓库状态..."
    
    if [ ! -d ".git" ]; then
        echo "❌ 当前目录不是 Git 仓库"
        echo "请先运行以下命令初始化 Git 仓库："
        echo "git init"
        echo "git add ."
        echo "git commit -m 'Initial commit'"
        exit 1
    fi
    
    # 检查是否有未提交的更改
    if [ -n "$(git status --porcelain)" ]; then
        echo "⚠️  检测到未提交的更改"
        read -p "是否要提交这些更改？(y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git add .
            git commit -m "Auto commit before deployment"
        fi
    fi
    
    echo "✅ Git 仓库状态正常"
}

# 显示部署说明
show_deployment_instructions() {
    echo ""
    echo "📋 部署步骤说明"
    echo "================"
    echo ""
    echo "1. 后端部署 (Render):"
    echo "   - 访问 https://render.com"
    echo "   - 注册账号并连接 GitHub"
    echo "   - 创建新的 Web Service"
    echo "   - 选择你的仓库，设置根目录为 'server'"
    echo "   - 构建命令: npm install"
    echo "   - 启动命令: npm start"
    echo "   - 添加环境变量: NODE_ENV=production, PORT=10000"
    echo ""
    echo "2. 前端部署 (Vercel):"
    echo "   - 访问 https://vercel.com"
    echo "   - 注册账号并连接 GitHub"
    echo "   - 导入你的仓库"
    echo "   - 设置根目录为 'client'"
    echo "   - 添加环境变量: NEXT_PUBLIC_API_URL=https://your-render-app.onrender.com/api"
    echo ""
    echo "3. 测试部署:"
    echo "   - 访问你的 Vercel 前端地址"
    echo "   - 测试所有功能是否正常"
    echo ""
    echo "4. 分享链接:"
    echo "   - 将 Vercel 前端地址分享给其他人"
    echo ""
    echo "📖 详细说明请查看 DEPLOYMENT.md 文件"
    echo ""
}

# 主函数
main() {
    check_requirements
    check_git_status
    show_deployment_instructions
    
    echo "🎉 部署准备完成！"
    echo "请按照上述步骤进行部署。"
    echo ""
    echo "💡 提示："
    echo "- 确保你的数据库配置正确"
    echo "- 部署后记得测试所有功能"
    echo "- 如果遇到问题，请查看 DEPLOYMENT.md 中的故障排除部分"
}

# 运行主函数
main 