# 服务器部署指南

## 1. 服务器环境准备

确保服务器已安装 Docker 和 Docker Compose：

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose -y
sudo systemctl enable docker
sudo systemctl start docker

# CentOS/RHEL
sudo yum install docker docker-compose -y
sudo systemctl enable docker
sudo systemctl start docker
```

## 2. 上传项目到服务器

### 方法一：使用 SCP（推荐）
在本地电脑执行：
```bash
# 替换 your-server-ip 为你的服务器IP
scp -r C:\\Users\\PC\\Desktop\\task-app\\* root@your-server-ip:/opt/task-app/
```

### 方法二：手动上传
1. 将项目文件夹打包：`tar -czf task-app.tar.gz task-app/`
2. 上传到服务器 `/opt/` 目录
3. 解压：`tar -xzf task-app.tar.gz`

## 3. 配置生产环境

在服务器上创建生产环境配置文件：

```bash
cd /opt/task-app
cat > .env.production << EOF
DATABASE_URL=postgresql://postgres:password123@postgres:5432/taskapp
DIRECT_URL=postgresql://postgres:password123@postgres:5432/taskapp
NODE_ENV=production
NEXTAUTH_URL=http://你的服务器IP:3000
NEXTAUTH_SECRET=DBPy9WQnAQBHX/Y+4tCmR6yjTnAGACyVwCr8bkYibX8=
JWT_SECRET=HUGTTSMPv68cKG8CM1p1HSxytn/dWeGhJRf1dOISkAk=
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
NODE_OPTIONS=--max_old_space_size=2048
DEBUG=false
LOG_LEVEL=info
FEATURE_AUTH_ENABLED=true
FEATURE_TASKS_ENABLED=true
FEATURE_POMODORO_ENABLED=true
NEXT_TELEMETRY_DISABLED=1
EOF
```

## 4. 执行部署

```bash
cd /opt/task-app
chmod +x docker-deploy.sh
./docker-deploy.sh
```

## 5. 验证部署

```bash
# 检查服务状态
docker-compose ps

# 查看应用日志
docker-compose logs app

# 测试应用访问
curl http://localhost:3000
```

## 6. 配置防火墙（如果需要）

```bash
# Ubuntu/Debian
sudo ufw allow 3000/tcp
sudo ufw allow 5432/tcp

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=5432/tcp
sudo firewall-cmd --reload
```

## 7. 域名和 HTTPS 配置（可选）

使用 Nginx 反向代理：

```bash
# 安装 Nginx
sudo apt install nginx -y

# 创建 Nginx 配置
sudo nano /etc/nginx/sites-available/task-app
```

Nginx 配置内容：
```nginx
server {
    listen 80;
    server_name 你的域名.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/task-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 8. 日常维护命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f app

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 更新部署（重新构建）
docker-compose build --no-cache
docker-compose up -d

# 备份数据库
docker-compose exec postgres pg_dump -U postgres taskapp > backup.sql

# 恢复数据库
docker-compose exec -T postgres psql -U postgres taskapp < backup.sql
```

## 故障排除

1. **应用无法启动**：检查 `docker-compose logs app`
2. **数据库连接失败**：检查 PostgreSQL 服务状态
3. **端口被占用**：修改 `docker-compose.yml` 中的端口映射
4. **内存不足**：增加服务器内存或优化 Docker 配置

## 安全建议

1. 修改默认的数据库密码
2. 使用 HTTPS
3. 定期备份数据库
4. 监控服务器资源使用情况
5. 保持系统和 Docker 更新