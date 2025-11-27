import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';
import {
  errorHandler,
  formatErrorResponse,
  ErrorCodes,
  createError,
} from '@/lib/error-handler';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 验证输入
    if (!email || !password) {
      throw createError(
        ErrorCodes.VALIDATION_ERROR,
        '邮箱和密码都是必填项',
        400
      );
    }

    // 用户登录
    const authResponse = await loginUser(email, password);

    // 设置HTTP-only cookie
    const response = NextResponse.json({
      user: authResponse.user,
      token: authResponse.token, // 同时返回token给前端
      message: '登录成功',
    });

    response.cookies.set('token', authResponse.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7天
    });

    return response;
  } catch (error) {
    console.error('登录错误:', error);

    // 如果是认证错误，直接创建特定的错误
    if (error instanceof Error && error.message === '邮箱或密码错误') {
      const authError = createError(
        ErrorCodes.AUTHENTICATION_ERROR,
        '邮箱或密码错误',
        401
      );
      return NextResponse.json(formatErrorResponse(authError), {
        status: authError.statusCode,
      });
    }

    const appError = errorHandler(error);
    return NextResponse.json(formatErrorResponse(appError), {
      status: appError.statusCode,
    });
  }
}