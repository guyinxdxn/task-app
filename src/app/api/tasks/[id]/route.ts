import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
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
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title, content, completed, goal, repetitionFrequency } = await req.json();
    
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
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title, content, completed, goal, repetitionFrequency } = await req.json();
    
    const updateData: any = {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(completed !== undefined && { completed }),
      ...(goal !== undefined && { goal }),
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
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
}
