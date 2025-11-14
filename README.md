# 任务管理应用 (Task Management App)

这是一个基于 Next.js 14 和 Prisma 构建的现代化任务管理应用，具有完整的 CRUD 功能。

## 功能特性

- ✅ 任务列表展示
- ✅ 添加新任务
- ✅ 编辑任务（标题和内容）
- ✅ 标记任务完成状态
- ✅ 删除任务
- ✅ 响应式设计
- ✅ 暗色主题
- ✅ 实时数据同步

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **数据库**: SQLite with Prisma ORM
- **类型安全**: TypeScript
- **UI组件**: 自定义 React 组件

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/tasks/          # REST API 路由
│   ├── globals.css         # 全局样式
│   ├── layout.tsx          # 应用布局
│   └── page.tsx            # 主页组件
├── components/             # React 组件
│   ├── Header.tsx          # 页面头部
│   ├── TaskList.tsx        # 任务列表
│   ├── TaskItem.tsx        # 单个任务项
│   └── TaskEditor.tsx      # 任务编辑器
├── lib/                    # 工具库
│   └── prisma.ts           # Prisma 客户端
└── types/                  # TypeScript 类型定义
    └── task.ts             # 任务类型定义
```

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 pnpm

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 数据库设置

1. 生成 Prisma 客户端：

```bash
npx prisma generate
```

2. 运行数据库迁移：

```bash
npx prisma migrate dev
```

### 启动开发服务器

```bash
npm run dev
# 或
pnpm dev
```

应用将在 http://localhost:3000 启动。

## API 接口

### 获取所有任务

```http
GET /api/tasks
```

### 获取单个任务

```http
GET /api/tasks/:id
```

### 创建新任务

```http
POST /api/tasks
Content-Type: application/json

{
  "title": "任务标题",
  "content": "任务内容"
}
```

### 更新任务

```http
PUT /api/tasks/:id
Content-Type: application/json

{
  "title": "新标题",
  "content": "新内容",
  "completed": true
}
```

### 删除任务

```http
DELETE /api/tasks/:id
```

## 部署

### 生产环境构建

```bash
npm run build
npm start
```

### 环境变量

创建 `.env` 文件：

```env
DATABASE_URL="file:./dev.db"
```

## 开发说明

- 使用 TypeScript 确保类型安全
- 遵循 React Hooks 最佳实践
- 使用 Tailwind CSS 进行样式设计
- 数据库操作通过 Prisma ORM 处理
- API 路由遵循 RESTful 设计原则

## 许可证

MIT License
