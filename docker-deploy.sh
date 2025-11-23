#!/bin/bash

# Docker 部署脚本
set -e

echo "🚀 开始部署 Task App..."

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "⚠️  未找到 .env 文件，请确保已配置数据库连接信息"
    echo "📝 请创建 .env 文件并设置 DATABASE_URL 和 DIRECT_URL"
    exit 1
fi

echo "📦 构建 Docker 镜像..."
docker-compose build app

echo "🚀 启动应用..."
docker-compose up -d app

echo "⏳ 等待应用启动..."
sleep 10

# 检查应用状态
echo "🔍 检查应用健康状态..."
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ 应用启动成功！"
    echo "🌐 应用地址: http://localhost:3000"
else
    echo "⚠️  应用启动可能有问题，请检查日志"
    echo "📋 查看日志: docker-compose logs app"
fi

echo ""
echo "📋 常用命令:"
echo "   查看日志: docker-compose logs app"
echo "   停止应用: docker-compose down"
echo "   重启应用: docker-compose restart app"
echo "   查看状态: docker-compose ps"