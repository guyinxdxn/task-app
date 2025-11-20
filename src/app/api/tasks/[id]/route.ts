import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

const getTask = async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const task = await prisma.task.findFirst({
      where: { 
        id,
        userId: req.userId 
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
};

export const GET = withAuth(getTask);

const updateTask = async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const { title, content, completed, goal, repetitionFrequency, totalTimeSpent } = await req.json();
    
    // 先检查任务是否存在且属于当前用户
    const existingTask = await prisma.task.findFirst({
      where: { 
        id,
        userId: req.userId 
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
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
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
};

export const PUT = withAuth(updateTask);

const patchTask = async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const { title, content, completed, goal, repetitionFrequency, totalTimeSpent } = await req.json();
    
    // 先检查任务是否存在且属于当前用户
    const existingTask = await prisma.task.findFirst({
      where: { 
        id,
        userId: req.userId 
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
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
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
};

export const PATCH = withAuth(patchTask);

const deleteTask = async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    
    // 先检查任务是否存在且属于当前用户
    const existingTask = await prisma.task.findFirst({
      where: { 
        id,
        userId: req.userId 
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
};

export const DELETE = withAuth(deleteTask);
