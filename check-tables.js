const { PrismaClient } = require('@prisma/client');

async function checkTables() {
  try {
    console.log('正在检查Supabase数据库中的表结构...');

    const prisma = new PrismaClient();

    // 检查是否存在Task表
    console.log('\n1. 检查Task表是否存在...');
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Task'
      `;

      if (tables.length > 0) {
        console.log('✅ Task表存在');

        // 检查Task表的列结构
        console.log('\n2. 检查Task表的列结构...');
        const columns = await prisma.$queryRaw`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'Task'
          ORDER BY ordinal_position
        `;

        console.log('Task表的列结构:');
        columns.forEach(col => {
          console.log(
            `  - ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? '可空' : '非空'})`
          );
        });

        // 检查是否有数据
        console.log('\n3. 检查Task表中的数据...');
        const taskCount = await prisma.task.count();
        console.log(`Task表中的记录数量: ${taskCount}`);
      } else {
        console.log('❌ Task表不存在');
      }
    } catch (error) {
      console.log('❌ Task表不存在或无法访问');
    }

    await prisma.$disconnect();
    console.log('\n检查完成');
  } catch (error) {
    console.error('检查过程中出错:');
    console.error(error.message);
  }
}

checkTables();
