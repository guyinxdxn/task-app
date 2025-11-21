import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import {
  errorHandler,
  formatErrorResponse,
  ErrorCodes,
  createError,
} from '@/lib/error-handler';

const getTask = async (
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!task) {
      throw createError(ErrorCodes.NOT_FOUND, '任务不存在', 404);
    }

    return NextResponse.json(task);
  } catch (err) {
    console.error('获取任务详情失败:', err);
    const appError = errorHandler(err);
    return NextResponse.json(formatErrorResponse(appError), {
      status: appError.statusCode,
    });
  }
};

export const GET = withAuth(getTask);

const updateTask = async (
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const {
      title,
      content,
      completed,
      goal,
      repetitionFrequency,
      totalTimeSpent,
    } = await req.json();

    // 先检查任务是否存在且属于当前用户
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!existingTask) {
      throw createError(ErrorCodes.NOT_FOUND, '任务不存在', 404);
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

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(completed !== undefined && { completed }),
        ...(goal !== undefined && { goal }),
        ...(totalTimeSpent !== undefined && { totalTimeSpent }),
        repeatType,
        repeatInterval,
      },
    });

    return NextResponse.json(task);
  } catch (err) {
    console.error('更新任务失败:', err);
    const appError = errorHandler(err);
    return NextResponse.json(formatErrorResponse(appError), {
      status: appError.statusCode,
    });
  }
};

export const PUT = withAuth(updateTask);

const patchTask = async (
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const {
      title,
      content,
      completed,
      goal,
      repetitionFrequency,
      totalTimeSpent,
    } = await req.json();

    // 先检查任务是否存在且属于当前用户
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!existingTask) {
      throw createError(ErrorCodes.NOT_FOUND, '任务不存在', 404);
    }

    const updateData: any = {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(completed !== undefined && { completed }),
      ...(goal !== undefined && { goal }),
      ...(totalTimeSpent !== undefined && { totalTimeSpent }),
    };

    if (repetitionFrequency !== undefined) {
      if (repetitionFrequency === '') {
        updateData.repeatType = 'none';
        updateData.repeatInterval = null;
      } else if (repetitionFrequency === '1') {
        updateData.repeatType = 'daily';
        updateData.repeatInterval = null;
      } else if (repetitionFrequency === '7') {
        updateData.repeatType = 'weekly';
        updateData.repeatInterval = null;
      } else {
        updateData.repeatType = 'every_n_days';
        updateData.repeatInterval = parseInt(repetitionFrequency);
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(task);
  } catch (err) {
    console.error('部分更新任务失败:', err);
    const appError = errorHandler(err);
    return NextResponse.json(formatErrorResponse(appError), {
      status: appError.statusCode,
    });
  }
};

export const PATCH = withAuth(patchTask);

const deleteTask = async (
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    // 先检查任务是否存在且属于当前用户
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!existingTask) {
      throw createError(ErrorCodes.NOT_FOUND, '任务不存在', 404);
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('删除任务失败:', err);
    const appError = errorHandler(err);
    return NextResponse.json(formatErrorResponse(appError), {
      status: appError.statusCode,
    });
  }
};

export const DELETE = withAuth(deleteTask);
