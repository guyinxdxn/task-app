import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: "desc" },
    });
    
    // 在Vercel环境中添加环境信息
    const response = {
      tasks,
      environment: process.env.VERCEL ? "vercel" : "local",
      message: process.env.VERCEL ? "使用模拟数据（Vercel环境SQLite不可用）" : "使用真实数据库"
    };
    
    return NextResponse.json(response);
  } catch (err) {
    console.error("GET Error:", err);
    return NextResponse.json(
      { 
        error: "Failed to fetch tasks",
        environment: process.env.VERCEL ? "vercel" : "local",
        message: process.env.VERCEL ? "Vercel环境使用模拟数据" : "数据库连接错误"
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { title, content } = await req.json();
    if (!title)
      return NextResponse.json({ error: "Title required" }, { status: 400 });

    const task = await prisma.task.create({ 
      data: { 
        title,
        content: content || ""
      } 
    });
    
    const response = {
      task,
      environment: process.env.VERCEL ? "vercel" : "local",
      message: process.env.VERCEL ? "模拟创建任务（Vercel环境数据不会持久化）" : "任务创建成功"
    };
    
    return NextResponse.json(response);
  } catch (err) {
    console.error("POST Error:", err);
    return NextResponse.json(
      { 
        error: "Failed to create task",
        environment: process.env.VERCEL ? "vercel" : "local"
      },
      { status: 500 }
    );
  }
}
