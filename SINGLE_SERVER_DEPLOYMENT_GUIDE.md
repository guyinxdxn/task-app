# 单服务器部署指南

## 🎯 部署目标
服务器地址：`http://43.139.204.176:3000/`

## 📋 前置条件

### 1. 服务器环境要求
- **操作系统**：Ubuntu 20.04+ / CentOS 7+
- **Node.js**：v18+ 
- **PostgreSQL**：v12+
- **内存**：至少 2GB
- **存储**：至少 10GB

### 2. 服务器软件安装
```bash
# 安装 Node.js (Ubuntu)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 pnpm
npm install -g pnpm

# 安装 PostgreSQL (Ubuntu)
sudo apt update
sudo apt install postgresql postgresql-contrib

# 启动 PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 🔧 配置步骤

### 1. 数据库配置
```bash
# 切换到 postgres 用户
sudo -u postgres psql

# 创建数据库和用户
CREATE DATABASE taskapp;
CREATE USER taskapp_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE taskapp TO taskapp_user;
\q
```

### 2. 更新环境配置
编辑 `.env.production` 文件，修改以下配置：

```env
# 数据库连接
DATABASE_URL="postgresql://taskapp_user:your-secure-password@localhost:5432/taskapp"
DIRECT_URL="postgresql://taskapp_user:your-secure-password@localhost:5432/taskapp"

# Next.js 配置
NEXTAUTH_URL=http://43.139.204.176:3000
NEXTAUTH_SECRET=your-32-character-secret-key-here

# JWT 配置
JWT_SECRET=your-32-character-jwt-secret-here
```

### 3. 生成安全密钥
```bash
# 生成 NEXTAUTH_SECRET
openssl rand -base64 32

# 生成 JWT_SECRET  
openssl rand -base64 32
```

## 🚀 部署步骤

### 方法1：使用部署脚本
```bash
# 给脚本执行权限
chmod +x deploy-single-server.sh

# 执行部署
./deploy-single-server.sh
```

### 方法2：手动部署
```bash
# 1. 上传代码到服务器
scp -r ./task-app/ user@43.139.204.176:/opt/

# 2. 安装依赖
cd /opt/task-app
pnpm install

# 3. 数据库迁移
pnpm prisma generate
pnpm prisma db push

# 4. 构建应用
pnpm build

# 5. 启动服务
pnpm start
```

## 🔒 安全配置

### 1. 防火墙配置
```bash
# 开放必要端口
sudo ufw allow 22    # SSH
sudo ufw allow 3000  # 应用端口
sudo ufw allow 5432  # 数据库端口（仅本地）
sudo ufw enable
```

### 2. 使用 PM2 进程管理
```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start npm --name "task-app" -- start

# 设置开机自启
pm2 startup
pm2 save
```

### 3. Nginx 反向代理（可选）
```nginx
server {
    listen 80;
    server_name 43.139.204.176;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🐛 故障排除

### 1. 检查服务状态
```bash
# 检查应用状态
pm2 status

# 检查数据库连接
sudo systemctl status postgresql

# 检查端口占用
netstat -tulpn | grep :3000
```

### 2. 查看日志
```bash
# 应用日志
pm2 logs task-app

# 数据库日志
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### 3. 常见问题
- **端口被占用**：修改应用端口或停止占用端口的服务
- **数据库连接失败**：检查 PostgreSQL 服务状态和连接配置
- **内存不足**：增加服务器内存或优化应用配置

## 📊 监控和维护

### 1. 资源监控
```bash
# 查看系统资源
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h
```

### 2. 备份策略
```bash
# 数据库备份
pg_dump taskapp > backup_$(date +%Y%m%d).sql

# 应用代码备份
tar -czf app_backup_$(date +%Y%m%d).tar.gz /opt/task-app/
```

## 📞 支持信息

如果遇到问题，请检查：
1. 服务器防火墙设置
2. 数据库连接配置
3. 环境变量设置
4. 应用日志输出

部署完成后，你的应用将可以通过 `http://43.139.204.176:3000` 访问。