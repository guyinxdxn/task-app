# 任务应用部署步骤指南

## 服务器准备（在服务器上执行）

### 1. 连接服务器
```bash
ssh jack@43.139.204.176
```

### 2. 安装Docker和Docker Compose
```bash
# 更新系统包
sudo apt update

# 安装Docker
sudo apt install docker.io -y

# 安装Docker Compose
sudo apt install docker-compose -y

# 将用户添加到docker组
sudo usermod -aG docker $USER

# 重新登录或刷新权限
su - $USER

# 验证安装
docker --version
docker-compose --version
```

### 3. 清理现有部署
```bash
# 进入项目目录
cd ~/task-app

# 停止并删除现有容器
sudo docker-compose down

# 清理Docker系统
sudo docker system prune -f

# 删除旧的项目文件（如果需要）
rm -rf ~/task-app/*
```

## 文件上传（在本地电脑执行）

### 4. 上传项目文件到服务器
```bash
# 在PowerShell中执行
scp -r C:\Users\PC\Desktop\task-app\* jack@43.139.204.176:~/task-app/
```

## 服务器部署（在服务器上执行）

### 5. 配置生产环境
```bash
# 进入项目目录
cd ~/task-app

# 创建生产环境配置文件
cp .env.production.server .env.production

# 确保文件权限正确
sudo chown -R $USER:$USER .

# 给部署脚本执行权限
chmod +x docker-deploy.sh
```

### 6. 执行部署
```bash
# 使用部署脚本
./docker-deploy.sh

# 或者手动部署
sudo docker-compose up -d
```

### 7. 验证部署
```bash
# 检查服务状态
sudo docker-compose ps

# 查看应用日志
sudo docker-compose logs app

# 测试应用访问
curl http://localhost:3000

# 检查数据库连接
sudo docker-compose exec app npx prisma db status
```

## 故障排除

### 如果遇到权限问题
```bash
# 临时解决方案
sudo docker-compose down
sudo docker-compose up -d

# 或者修复Docker socket权限
sudo chmod 666 /var/run/docker.sock
```

### 如果应用无法启动
```bash
# 查看详细日志
sudo docker-compose logs app --tail=50

# 检查数据库状态
sudo docker-compose logs postgres

# 重新构建镜像
sudo docker-compose build --no-cache
sudo docker-compose up -d
```

## 日常维护命令

```bash
# 查看服务状态
sudo docker-compose ps

# 查看应用日志
sudo docker-compose logs app

# 重启服务
sudo docker-compose restart

# 更新部署（上传新文件后）
sudo docker-compose down
sudo docker-compose up -d

# 备份数据库
sudo docker-compose exec postgres pg_dump -U postgres taskapp > backup.sql
```

## 重要文件说明

- `docker-deploy.sh` - 自动化部署脚本
- `docker-compose.yml` - Docker服务配置
- `.env.production` - 生产环境变量配置
- `prisma/schema.prisma` - 数据库架构定义

## 访问应用

部署成功后，通过以下地址访问应用：
- 服务器IP: http://43.139.204.176:3000
- 本地测试: http://localhost:3000

## 注意事项

1. 确保服务器防火墙开放3000端口
2. 定期备份数据库
3. 监控应用日志和性能
4. 及时更新安全补丁