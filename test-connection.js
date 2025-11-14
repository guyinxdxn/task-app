const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  try {
    console.log('正在测试Supabase数据库连接...');
    
    const prisma = new PrismaClient();
    
    // 尝试执行一个简单的查询
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ 数据库连接成功！');
    console.log('查询结果:', result);
    
    await prisma.$disconnect();
    console.log('连接已关闭');
    
  } catch (error) {
    console.error('❌ 数据库连接失败:');
    console.error(error.message);
    
    if (error.code) {
      console.error('错误代码:', error.code);
    }
  }
}

testConnection();