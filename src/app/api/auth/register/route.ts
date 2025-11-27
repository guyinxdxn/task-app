import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';
import {
  errorHandler,
  formatErrorResponse,
  ErrorCodes,
  createError,
} from '@/lib/error-handler';

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();

    // 验证输入
    if (!email || !name || !password) {
      throw createError(
        ErrorCodes.VALIDATION_ERROR,
        '邮箱、姓名和密码都是必填项',
        400
      );
    }

    if (password.length < 6) {
      throw createError(ErrorCodes.VALIDATION_ERROR, '密码长度至少为6位', 400);
    }

    // 注册用户
    const authResponse = await registerUser(email, name, password);

    // 设置HTTP-only cookie
    const response = NextResponse.json({
      user: authResponse.user,
      token: authResponse.token, // 同时返回token给前端
      message: '注册成功',
    });

    response.cookies.set('token', authResponse.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7天
    });

    return response;
  } catch (error) {
    console.error('注册错误:', error);

    // 如果是用户已存在的错误，直接创建特定的错误
    if (error instanceof Error && error.message.includes('已存在')) {
      const validationError = createError(
        ErrorCodes.VALIDATION_ERROR,
        '用户已存在',
        409
      );
      return NextResponse.json(formatErrorResponse(validationError), {
        status: validationError.statusCode,
      });
    }

    const appError = errorHandler(error);
    return NextResponse.json(formatErrorResponse(appError), {
      status: appError.statusCode,
    });
  }
}