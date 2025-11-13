// 使用类型断言解决PrismaClient导入问题
const { PrismaClient } = require('@prisma/client') as any;

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
