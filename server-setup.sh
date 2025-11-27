#!/bin/bash

# ============================================
# 单服务器部署脚本 - 服务器端
# ============================================

echo "🚀 开始服务器环境设置..."

# 检查系统
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "✅ 检测到 Linux 系统"
else
    echo "❌ 仅支持 Linux 系统"
    exit 1
fi

# 更新系统包
sudo apt update && sudo apt upgrade -y

# 安装必要软件
sudo apt install -y curl wget git build-essential

# 安装 Node.js 20.x
echo "📦 安装 Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PostgreSQL
echo "🗄️ 安装 PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# 启动 PostgreSQL 服务
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 创建数据库和用户
echo "🔧 配置 PostgreSQL 数据库..."
sudo -u postgres psql -c "CREATE DATABASE taskapp;"
sudo -u postgres psql -c "CREATE USER taskapp_user WITH PASSWORD '5cbc507260dc8f9d6a835cad9603f96d';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE taskapp TO taskapp_user;"

# 修改 PostgreSQL 配置允许本地连接
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf
sudo sed -i "s/host    all             all             127.0.0.1\/32            md5/host    all             all             0.0.0.0\/0               md5/" /etc/postgresql/*/main/pg_hba.conf

# 重启 PostgreSQL
sudo systemctl restart postgresql

echo "✅ 服务器环境设置完成！"
echo ""
echo "📋 下一步操作："
echo "1. 将项目代码上传到服务器"
echo "2. 运行 deploy-single-server.sh 进行应用部署"
echo "3. 配置防火墙开放 3000 端口：sudo ufw allow 3000"
echo ""
echo "🔑 数据库信息："
echo "- 数据库名: taskapp"
echo "- 用户名: taskapp_user"
echo "- 密码: 5cbc507260dc8f9d6a835cad9603f96d"
echo "- 连接地址: localhost:5432"