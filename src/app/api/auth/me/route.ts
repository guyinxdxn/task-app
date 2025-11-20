import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 从cookie获取token
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 验证token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: '无效的token' },
        { status: 401 }
      );
    }

    // 获取用户信息
    const user = await getCurrentUser(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    );
  }
}