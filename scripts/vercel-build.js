const { execSync } = require('child_process');

console.log('Starting Vercel build process...');

// 检查是否配置了Supabase数据库连接
const hasSupabaseConfig = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase');

if (hasSupabaseConfig) {
  console.log('Detected Supabase database configuration');
  
  // 在Vercel环境中需要重新生成Prisma Client
  console.log('Generating Prisma Client for Vercel environment...');
  try {
    // 使用环境变量直接生成Prisma Client，避免加载prisma.config.ts
    execSync('npx prisma generate --schema=./prisma/schema.prisma', { stdio: 'inherit' });
  } catch (error) {
    console.error('Prisma generation failed, attempting fallback...');
    // 如果生成失败，尝试使用allow-no-models模式
    execSync('npx prisma generate --schema=./prisma/schema.prisma --allow-no-models', { stdio: 'inherit' });
  }
} else {
  console.log('Warning: No Supabase database configuration detected');
  console.log('Attempting to generate Prisma Client without database connection...');
  // 使用schema文件直接生成，避免加载配置文件
  execSync('npx prisma generate --schema=./prisma/schema.prisma --allow-no-models', { stdio: 'inherit' });
}

// 运行Next.js构建
console.log('Running next build...');
execSync('npx next build', { stdio: 'inherit' });

console.log('Vercel build completed successfully!');