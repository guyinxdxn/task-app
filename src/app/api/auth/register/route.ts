import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();

    // 验证输入
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: '邮箱、姓名和密码都是必填项' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少为6位' },
        { status: 400 }
      );
    }

    // 注册用户
    const authResponse = await registerUser(email, name, password);

    // 设置HTTP-only cookie
    const response = NextResponse.json({
      user: authResponse.user,
      message: '注册成功'
    });

    response.cookies.set('token', authResponse.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7天
    });

    return response;
  } catch (error) {
    console.error('注册错误:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}