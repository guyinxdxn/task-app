import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getCurrentUser } from '@/lib/auth';
import {
  errorHandler,
  formatErrorResponse,
  ErrorCodes,
  createError,
} from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    // 从cookie获取token
    const token = request.cookies.get('token')?.value;

    if (!token) {
      throw createError(ErrorCodes.UNAUTHORIZED, '未授权访问', 401);
    }

    // 验证token
    const decoded = verifyToken(token);
    if (!decoded) {
      throw createError(ErrorCodes.UNAUTHORIZED, '无效的token', 401);
    }

    // 获取用户信息
    const user = await getCurrentUser(decoded.userId);
    if (!user) {
      throw createError(ErrorCodes.NOT_FOUND, '用户不存在', 404);
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('获取用户信息错误:', error);

    const appError = errorHandler(error);
    return NextResponse.json(formatErrorResponse(appError), {
      status: appError.statusCode,
    });
  }
}
