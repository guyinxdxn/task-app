import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

const getTasks = async (req: AuthenticatedRequest) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(tasks);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
};

export const GET = withAuth(getTasks);

const createTask = async (req: AuthenticatedRequest) => {
  try {
    const { title, content, goal, repetitionFrequency } = await req.json();
    if (!title)
      return NextResponse.json({ error: 'Title required' }, { status: 400 });

    let repeatType = 'none';
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
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
};

export const POST = withAuth(createTask);
