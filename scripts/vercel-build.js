const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Vercel build process...');

// 检查是否是Vercel环境
const isVercel = process.env.VERCEL === '1';

if (isVercel) {
  console.log('Detected Vercel environment');
  
  // 在Vercel环境中，创建一个临时的SQLite数据库文件
  const dbPath = path.join('/tmp', 'dev.db');
  
  // 如果数据库文件不存在，创建一个空的
  if (!fs.existsSync(dbPath)) {
    console.log('Creating temporary database file at:', dbPath);
    fs.writeFileSync(dbPath, '');
  }
  
  // 设置环境变量
  process.env.DATABASE_URL = `file:${dbPath}`;
}

// 运行Prisma生成
console.log('Running prisma generate...');
execSync('prisma generate', { stdio: 'inherit' });

// 运行Next.js构建
console.log('Running next build...');
execSync('next build', { stdio: 'inherit' });

console.log('Vercel build completed successfully!');