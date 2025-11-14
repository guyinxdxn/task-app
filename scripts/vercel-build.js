const { execSync } = require('child_process');

console.log('Starting Vercel build process...');

// 检查是否配置了Supabase数据库连接
const hasSupabaseConfig = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase');

if (hasSupabaseConfig) {
  console.log('Detected Supabase database configuration');
  
  // 在Vercel环境中需要重新生成Prisma Client
  console.log('Generating Prisma Client for Vercel environment...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
  } catch (error) {
    console.error('Prisma generation failed, attempting fallback...');
    // 如果生成失败，尝试使用schema-only模式
    execSync('npx prisma generate --allow-no-models', { stdio: 'inherit' });
  }
} else {
  console.log('Warning: No Supabase database configuration detected');
  console.log('Attempting to generate Prisma Client without database connection...');
  execSync('npx prisma generate --allow-no-models', { stdio: 'inherit' });
}

// 运行Next.js构建
console.log('Running next build...');
execSync('npx next build', { stdio: 'inherit' });

console.log('Vercel build completed successfully!');