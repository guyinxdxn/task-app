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
    const { title, content } = await req.json();
    if (!title)
      return NextResponse.json({ error: 'Title required' }, { status: 400 });

    const task = await prisma.task.create({
      data: {
        title,
        content: content || '',
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
