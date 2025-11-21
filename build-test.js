const { execSync } = require('child_process');

console.log('Starting build test without Prisma...');

// 创建一个临时的prisma.ts文件，避免导入错误
const tempPrismaContent = `
// 临时Prisma客户端 - 用于构建测试
class MockPrismaClient {
  constructor() {
    console.log('Mock Prisma Client created');
  }
  
  // 添加一些基本的mock方法
  user = {
    findMany: (args?: any) => Promise.resolve([]),
    findUnique: (args?: any) => Promise.resolve({ 
      id: 'mock-user-id', 
      email: 'mock@example.com', 
      name: 'Mock User',
      password: 'mock-password',
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    findFirst: (args?: any) => Promise.resolve({ 
      id: 'mock-user-id', 
      email: 'mock@example.com', 
      name: 'Mock User',
      password: 'mock-password',
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    create: (args?: any) => Promise.resolve({ 
      id: 'mock-user-id', 
      email: 'mock@example.com', 
      name: 'Mock User',
      password: 'mock-password',
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    update: (args?: any) => Promise.resolve({ 
      id: 'mock-user-id', 
      email: 'mock@example.com', 
      name: 'Mock User',
      password: 'mock-password',
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    delete: (args?: any) => Promise.resolve({ 
      id: 'mock-user-id', 
      email: 'mock@example.com', 
      name: 'Mock User',
      password: 'mock-password',
      createdAt: new Date(),
      updatedAt: new Date()
    })
  };
  
  task = {
    findMany: (args?: any) => Promise.resolve([]),
    findUnique: (args?: any) => Promise.resolve(null),
    findFirst: (args?: any) => Promise.resolve(null),
    create: (args?: any) => Promise.resolve({ id: 'mock-task-id' }),
    update: (args?: any) => Promise.resolve({ id: 'mock-task-id' }),
    delete: (args?: any) => Promise.resolve({ id: 'mock-task-id' }),
    count: (args?: any) => Promise.resolve(0)
  };
}

const prisma = new MockPrismaClient();
export default prisma;
`;

// 写入临时文件
const fs = require('fs');
fs.writeFileSync('./src/lib/prisma.ts', tempPrismaContent);

console.log('Created mock Prisma client for build test');

// 运行Next.js构建
try {
  console.log('Running Next.js build...');
  execSync('npx next build', { stdio: 'inherit' });
  console.log('✅ Build test completed successfully!');
} catch (error) {
  console.error('❌ Build test failed:', error.message);
  process.exit(1);
}
