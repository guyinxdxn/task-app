import { NextResponse } from "next/server";

// 模拟数据库
let posts = [
  { id: 1, title: "Hello Next.js", content: "This is your first post." },
];

export async function GET() {
  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const { title, content } = await req.json();
  const newPost = { id: Date.now(), title, content };
  posts.push(newPost);
  return NextResponse.json(newPost, { status: 201 });
}
