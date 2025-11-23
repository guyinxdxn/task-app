# 服务器部署脚本 (Windows PowerShell)
# 使用方法：.\deploy-server.ps1

Write-Host "🚀 开始部署 task-app 到服务器..." -ForegroundColor Green

# 1. 安装依赖
Write-Host "📦 安装依赖..." -ForegroundColor Yellow
pnpm install --production

# 2. 检查环境变量
Write-Host "🔧 检查环境变量..." -ForegroundColor Yellow
if (-not $env:DATABASE_URL) {
    Write-Host "❌ 错误：DATABASE_URL 环境变量未设置" -ForegroundColor Red
    Write-Host "请设置生产环境数据库连接" -ForegroundColor Red
    exit 1
}

# 3. 运行数据库迁移
Write-Host "🗄️  运行数据库迁移..." -ForegroundColor Yellow
pnpm prisma generate
pnpm prisma migrate deploy

# 4. 构建应用
Write-Host "🏗️  构建应用..." -ForegroundColor Yellow
pnpm build

# 5. 启动应用
Write-Host "🚀 启动应用..." -ForegroundColor Yellow

# 检查是否使用 PM2
if (Get-Command pm2 -ErrorAction SilentlyContinue) {
    Write-Host "📊 使用 PM2 启动应用..." -ForegroundColor Cyan
    pm2 stop task-app -s
    pm2 start npm --name "task-app" -- start
    pm2 save
    pm2 startup
} else {
    Write-Host "⚡ 直接启动应用..." -ForegroundColor Cyan
    Start-Process -NoNewWindow -FilePath "pnpm" -ArgumentList "start"
}

Write-Host "✅ 部署完成！" -ForegroundColor Green
Write-Host "🌐 应用地址：http://localhost:3000" -ForegroundColor Cyan
Write-Host "📊 使用 'pm2 status' 查看应用状态" -ForegroundColor Cyan