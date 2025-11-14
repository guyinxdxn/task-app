// 简单的Prisma配置，避免复杂的导入问题
require('dotenv').config();

module.exports = {
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  engine: 'classic',
  datasource: {
    url: process.env.DATABASE_URL || process.env.DIRECT_URL || 'file:./dev.db',
  },
};
