const { execSync } = require('child_process');

console.log('Starting Vercel build process...');

// 检查是否配置了Supabase数据库连接
const hasSupabaseConfig = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase');

if (hasSupabaseConfig) {
  console.log('Detected Supabase database configuration');
  console.log('Skipping Prisma generation - using existing client');
} else {
  console.log('Warning: No Supabase database configuration detected');
  console.log('Application may not function properly without database connection');
}

// 直接运行Next.js构建（Prisma Client已在本地生成）
console.log('Running next build...');
execSync('npx next build', { stdio: 'inherit' });

console.log('Vercel build completed successfully!');