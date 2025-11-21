动作,命令,耗时预估

1. 修改 Schema,编辑 schema.prisma 文件,几秒到几分钟 (取决于修改复杂性)
2. 执行迁移,npx prisma migrate dev --name <新的名称>,通常 5 到 20 秒
3. 生成客户端,npx prisma generate,通常 1 到 5 秒
