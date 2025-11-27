#!/bin/bash

# ============================================
# Docker 部署脚本
# ============================================
set -e

echo "� 开始 Docker 部署..."

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

echo "✅ Docker 版本: $(docker --version)"
echo "✅ Docker Compose 版本: $(docker-compose --version)"

# 检查环境变量文件
if [ ! -f .env.production ]; then
    echo "⚠️ 未找到 .env.production 文件，使用默认配置"
    echo "� 提示: 建议创建 .env.production 文件进行生产环境配置"
fi

# 停止并删除现有容器
echo "🧹 清理现有容器..."
docker-compose down

# 构建并启动服务
echo "� 构建 Docker 镜像..."
docker-compose build --no-cache

# 启动服务
echo "🚀 启动 Docker 服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."

# 检查数据库服务
if docker-compose ps postgres | grep -q "Up"; then
    echo "✅ 数据库服务运行正常"
else
    echo "❌ 数据库服务启动失败"
    docker-compose logs postgres
    exit 1
fi

# 检查应用服务
if docker-compose ps app | grep -q "Up"; then
    echo "✅ 应用服务运行正常"
else
    echo "❌ 应用服务启动失败"
    docker-compose logs app
    exit 1
fi

# 测试应用健康检查
echo "🔬 测试应用健康检查..."
if curl -f http://localhost:3000/api/health &> /dev/null; then
    echo "✅ 应用健康检查通过"
else
    echo "⚠️ 应用健康检查失败，但服务仍在运行"
fi

echo ""
echo "🎉 Docker 部署完成！"
echo ""
echo "📋 服务信息："
echo "- 应用访问: http://localhost:3000"
echo "- 数据库端口: localhost:5432"
echo "- 数据库密码: 5cbc507260dc8f9d6a835cad9603f96d"
echo ""
echo "� 管理命令："
echo "- 查看日志: docker-compose logs -f"
echo "- 停止服务: docker-compose down"
echo "- 重启服务: docker-compose restart"
echo "- 查看状态: docker-compose ps"
echo ""
echo "💡 生产部署提示："
echo "- 确保防火墙开放 3000 端口"
echo "- 配置域名和 HTTPS"
echo "- 定期备份数据库卷"
echo "- 监控容器资源使用情况"