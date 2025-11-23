#!/bin/bash

# 服务器部署脚本
# 使用方法：./deploy-server.sh

echo "🚀 开始部署 task-app 到服务器..."

# 检查是否在服务器环境
if [ "$NODE_ENV" != "production" ]; then
    echo "⚠️  警告：当前环境不是生产环境"
fi

# 1. 安装依赖
echo "📦 安装依赖..."
pnpm install --production

# 2. 检查环境变量
echo "🔧 检查环境变量..."
if [ -z "$DATABASE_URL" ]; then
    echo "❌ 错误：DATABASE_URL 环境变量未设置"
    echo "请设置生产环境数据库连接"
    exit 1
fi

# 3. 运行数据库迁移
echo "🗄️  运行数据库迁移..."
pnpm prisma generate
pnpm prisma migrate deploy

# 4. 构建应用
echo "🏗️  构建应用..."
pnpm build

# 5. 启动应用
echo "🚀 启动应用..."

# 使用 PM2 管理进程（推荐）
if command -v pm2 &> /dev/null; then
    echo "📊 使用 PM2 启动应用..."
    pm2 stop task-app || true
    pm2 start npm --name "task-app" -- start
    pm2 save
    pm2 startup
else
    echo "⚡ 直接启动应用..."
    pnpm start &
fi

echo "✅ 部署完成！"
echo "🌐 应用地址：http://localhost:3000"
echo "📊 使用 'pm2 status' 查看应用状态"