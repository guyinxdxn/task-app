import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
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
}

export async function POST(req: Request) {
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
}
