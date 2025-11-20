import { PrismaClient } from '@prisma/client';

// 确保全局对象类型安全
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 创建或获取Prisma客户端实例
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
    errorFormat: 'minimal',
  });
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
      errorFormat: 'pretty',
    });
  }
  prisma = globalForPrisma.prisma;
}

// 确保prisma不为undefined
if (!prisma) {
  throw new Error('Prisma客户端初始化失败');
}

export default prisma;
