// 使用类型断言解决PrismaClient导入问题
const { PrismaClient } = require('@prisma/client') as any;

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined;
};

// 在Vercel环境中，使用内存数据库或返回模拟数据
let prisma;

if (process.env.VERCEL) {
  // Vercel环境：使用模拟数据
  prisma = {
    task: {
      findMany: async () => [
        { id: 1, title: "示例任务 1", content: "这是一个示例任务", createdAt: new Date() },
        { id: 2, title: "示例任务 2", content: "这是另一个示例任务", createdAt: new Date() }
      ],
      create: async (data: any) => ({
        id: Date.now(),
        ...data.data,
        createdAt: new Date()
      })
    }
  };
} else {
  // 本地环境：使用真实的Prisma客户端
  prisma = globalForPrisma.prisma ?? new PrismaClient();
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
  }
}

export default prisma;
