# 🚀 服务器部署操作指南

## 📋 快速开始

### 方法一：使用自动化脚本（推荐）

#### Linux/Unix 服务器：
```bash
# 1. 上传代码到服务器
scp -r ./task-app user@your-server:/opt/

# 2. 登录服务器
ssh user@your-server

# 3. 进入项目目录
cd /opt/task-app

# 4. 设置环境变量（重要！）
export DATABASE_URL="postgresql://username:password@your-db-host:5432/taskapp"
export DIRECT_URL="postgresql://username:password@your-db-host:5432/taskapp"
export NEXTAUTH_URL="https://your-domain.com"
export NEXTAUTH_SECRET="your-secret-key-here"

# 5. 运行部署脚本
chmod +x deploy-server.sh
./deploy-server.sh
```

#### Windows 服务器：
```powershell
# 1. 设置环境变量
$env:DATABASE_URL = "postgresql://username:password@your-db-host:5432/taskapp"
$env:DIRECT_URL = "postgresql://username:password@your-db-host:5432/taskapp"
$env:NEXTAUTH_URL = "https://your-domain.com"
$env:NEXTAUTH_SECRET = "your-secret-key-here"

# 2. 运行部署脚本
.\deploy-server.ps1
```

## 🔧 手动部署步骤

### 1. 服务器环境准备

#### 安装必要软件：
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nodejs npm postgresql

# CentOS/RHEL
sudo yum install -y nodejs npm postgresql

# 安装 pnpm
npm install -g pnpm
```

#### 安装 PM2（进程管理）：
```bash
npm install -g pm2
```

### 2. 数据库配置

#### 选项A：使用云数据库（推荐）
1. 注册 Supabase/PlanetScale/Railway
2. 创建新数据库项目
3. 获取数据库连接字符串
4. 替换环境变量中的连接信息

#### 选项B：服务器本地数据库
```bash
# 安装 PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 创建数据库和用户
sudo -u postgres psql
CREATE DATABASE taskapp;
CREATE USER taskuser WITH ENCRYPTED PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE taskapp TO taskuser;
\q
```

### 3. 应用部署

#### 上传代码：
```bash
# 使用 git（推荐）
git clone your-repo-url /opt/task-app

# 或使用 scp
scp -r ./task-app user@server:/opt/
```

#### 安装依赖：
```bash
cd /opt/task-app
pnpm install --production
```

#### 数据库迁移：
```bash
# 生成 Prisma 客户端
pnpm prisma generate

# 运行迁移
pnpm prisma migrate deploy
```

#### 构建应用：
```bash
pnpm build
```

#### 启动应用：
```bash
# 使用 PM2（推荐）
pm2 start npm --name "task-app" -- start
pm2 save
pm2 startup

# 或直接启动
pnpm start
```

## 🐳 Docker 部署（推荐）

### 1. 修改 docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://username:password@your-db-host:5432/taskapp
      - DIRECT_URL=postgresql://username:password@your-db-host:5432/taskapp
      - NODE_ENV=production
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: taskapp
      POSTGRES_USER: taskuser
      POSTGRES_PASSWORD: yourpassword
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### 2. 部署命令
```bash
# 构建和启动
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f app
```

## 🔒 安全配置

### 1. 防火墙设置
```bash
# Ubuntu/Debian
sudo ufw allow 22    # SSH
sudo ufw allow 3000  # 应用端口
sudo ufw allow 5432  # 数据库端口（如使用本地数据库）
sudo ufw enable
```

### 2. SSL 证书（HTTPS）
```bash
# 使用 Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 3. 环境变量保护
- 不要将敏感信息提交到代码仓库
- 使用服务器环境变量
- 定期更换密钥

## 📊 监控和维护

### 1. 应用监控
```bash
# PM2 监控
pm2 status
pm2 logs task-app
pm2 monit

# 系统资源
htop
df -h
```

### 2. 日志管理
```bash
# 查看应用日志
tail -f /opt/task-app/.pm2/logs/task-app-out.log

# 查看错误日志
tail -f /opt/task-app/.pm2/logs/task-app-error.log
```

### 3. 备份策略
```bash
# 数据库备份（每天）
0 2 * * * pg_dump -h localhost -U taskuser taskapp > /backup/taskapp_$(date +%Y%m%d).sql

# 应用代码备份（每周）
0 3 * * 0 tar -czf /backup/taskapp_code_$(date +%Y%m%d).tar.gz /opt/task-app
```

## 🚨 故障排除

### 常见问题：

1. **数据库连接失败**
   - 检查数据库服务状态
   - 验证连接字符串
   - 检查网络连接

2. **迁移失败**
   - 检查 Prisma schema 一致性
   - 查看详细错误日志
   - 确认数据库权限

3. **应用无法启动**
   - 检查端口占用：`netstat -tulpn | grep 3000`
   - 查看应用日志
   - 验证环境变量

### 紧急恢复：
```bash
# 重启应用
pm2 restart task-app

# 或使用 Docker
docker-compose restart app

# 回滚到上一个版本（如使用 git）
git checkout previous-commit
pnpm install
pnpm build
pm2 restart task-app
```

## 📞 支持信息

- **应用状态**：`pm2 status`
- **日志查看**：`pm2 logs task-app`
- **数据库状态**：`docker-compose ps` 或 `systemctl status postgresql`
- **系统资源**：`htop` 或 `docker stats`

---

**总结**：服务器部署的关键是确保环境配置正确、数据库连接正常、安全设置到位。建议先在测试环境验证，再部署到生产环境。