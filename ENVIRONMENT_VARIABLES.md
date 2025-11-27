# 环境变量配置指南

## 📋 文件说明

| 文件 | 用途 | 优先级 |
|------|------|--------|
| `.env` | 默认环境变量 | 最低 |
| `.env.local` | 本地开发环境 | 高 |
| `.env.production` | 生产环境配置 | 高 |
| `.env.example` | 配置示例模板 | 参考 |

## 🔧 核心配置说明

### 数据库配置
```bash
# 生产环境 (Supabase)
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
DIRECT_URL=postgresql://username:password@host:port/database?sslmode=require

# 开发环境 (本地)
DATABASE_URL=postgresql://postgres:password123@localhost:5432/taskapp
DIRECT_URL=postgresql://postgres:password123@localhost:5432/taskapp
```

### 认证安全配置
```bash
# NextAuth.js 配置
NEXTAUTH_URL=http://localhost:3000          # 开发环境
NEXTAUTH_URL=https://your-domain.com        # 生产环境
NEXTAUTH_SECRET=至少32位字符的密钥

# JWT 配置
JWT_SECRET=至少32位字符的密钥
JWT_EXPIRES_IN=7d                           # Token 有效期

# 密码加密
BCRYPT_SALT_ROUNDS=12                       # 加密强度
```

### 性能优化配置
```bash
# Node.js 内存配置
NODE_OPTIONS=--max_old_space_size=4096      # 生产环境 (4GB)
NODE_OPTIONS=--max_old_space_size=2048      # 开发环境 (2GB)

# Next.js 优化
NEXT_TELEMETRY_DISABLED=1                   # 禁用遥测
```

## 🚀 部署配置

### Docker 部署
```bash
# 1. 复制示例文件
cp .env.example .env

# 2. 编辑配置文件
# 修改 DATABASE_URL, NEXTAUTH_SECRET 等关键配置

# 3. 启动服务
docker-compose up -d
```

### 服务器直接部署
```bash
# 1. 设置环境变量
export DATABASE_URL="your-database-url"
export NEXTAUTH_SECRET="your-secret"

# 2. 运行部署脚本
./deploy-server.sh
```

## 🔒 安全最佳实践

1. **密钥管理**
   - 生产环境使用强密码生成器
   - 定期轮换密钥
   - 不要将密钥提交到版本控制

2. **环境隔离**
   - 开发、测试、生产环境使用不同配置
   - 使用不同的数据库实例
   - 配置不同的域名和端口

3. **敏感信息保护**
   - 将 `.env` 添加到 `.gitignore`
   - 使用环境变量而非硬编码
   - 定期审计配置安全性

## 🛠️ 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 DATABASE_URL 格式
   - 验证数据库服务是否运行
   - 检查网络连接和防火墙

2. **认证配置错误**
   - 确认 NEXTAUTH_URL 与访问域名一致
   - 检查 NEXTAUTH_SECRET 长度
   - 验证 JWT 配置

3. **内存不足**
   - 调整 NODE_OPTIONS 内存大小
   - 监控应用内存使用情况
   - 优化代码和依赖

### 调试技巧

```bash
# 检查环境变量是否加载
console.log('NODE_ENV:', process.env.NODE_ENV);

# 查看所有环境变量
console.log(process.env);

# 生产环境调试
DEBUG=true node server.js
```

## 📝 更新日志

- **2024-01-20**: 初始环境变量配置
- **2024-01-20**: 添加功能开关和性能优化配置
- **2024-01-20**: 完善安全配置和部署指南