// 使用CommonJS导入解决PrismaClient类型检查问题
import { PrismaClient as PrismaClientType } from '@prisma/client';

const PrismaClient = (require('@prisma/client') as any).PrismaClient as typeof PrismaClientType;

const globalForPrisma = globalThis as unknown as {
  prisma: typeof PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
