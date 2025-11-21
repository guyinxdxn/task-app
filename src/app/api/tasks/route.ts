import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import {
  errorHandler,
  formatErrorResponse,
  ErrorCodes,
  createError,
} from '@/lib/error-handler';

const getTasks = async (req: AuthenticatedRequest) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      orderBy: [
        // 第一优先级：按完成状态排序（未完成的在前）
        {
          completed: 'asc',
        },
        // 第二优先级：按状态排序
        {
          status: 'asc',
        },
        // 第三优先级：按创建时间降序（最新的在前）
        {
          createdAt: 'desc',
        },
      ],
    });
    return NextResponse.json(tasks);
  } catch (err) {
    console.error('获取任务列表失败:', err);
    const appError = errorHandler(err);
    return NextResponse.json(formatErrorResponse(appError), {
      status: appError.statusCode,
    });
  }
};

export const GET = withAuth(getTasks);

const createTask = async (req: AuthenticatedRequest) => {
  try {
    const { title, content, goal, repetitionFrequency } = await req.json();

    if (!title) {
      throw createError(ErrorCodes.VALIDATION_ERROR, '任务标题是必填项', 400);
    }

    let repeatType: 'none' | 'daily' | 'weekly' | 'every_n_days' = 'none';
    let repeatInterval = null;

    if (repetitionFrequency === '1') {
      repeatType = 'daily';
    } else if (repetitionFrequency === '7') {
      repeatType = 'weekly';
    } else if (repetitionFrequency) {
      repeatType = 'every_n_days';
      repeatInterval = parseInt(repetitionFrequency);
    }

    const task = await prisma.task.create({
      data: {
        title,
        content: content || '',
        goal,
        repeatType,
        repeatInterval,
        userId: req.userId!,
      },
    });
    return NextResponse.json(task);
  } catch (err) {
    console.error('创建任务失败:', err);
    const appError = errorHandler(err);
    return NextResponse.json(formatErrorResponse(appError), {
      status: appError.statusCode,
    });
  }
};

export const POST = withAuth(createTask);
