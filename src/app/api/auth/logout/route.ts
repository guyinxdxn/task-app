import { NextRequest, NextResponse } from 'next/server';
import { errorHandler, formatErrorResponse } from '@/lib/error-handler';

export async function POST(request: NextRequest) {
  try {
    // 清除cookie
    const response = NextResponse.json({
      message: '登出成功',
    });

    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_URL?.startsWith('https'),
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // 立即过期
    });

    return response;
  } catch (error) {
    console.error('登出错误:', error);

    const appError = errorHandler(error);
    return NextResponse.json(formatErrorResponse(appError), {
      status: appError.statusCode,
    });
  }
}
