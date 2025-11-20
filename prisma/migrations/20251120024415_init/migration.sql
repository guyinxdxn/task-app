-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('todo', 'in_progress', 'done', 'blocked', 'canceled');

-- CreateEnum
CREATE TYPE "RepeatType" AS ENUM ('none', 'daily', 'weekly', 'every_n_days');

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "goal" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "priority" "Priority" NOT NULL DEFAULT 'medium',
    "estimate" INTEGER,
    "dueDate" TIMESTAMP(3),
    "status" "Status" NOT NULL DEFAULT 'todo',
    "repeatType" "RepeatType" NOT NULL DEFAULT 'none',
    "repeatInterval" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);
