/**
 * 统一错误处理中间件
 * 提供标准的错误响应格式和错误处理机制
 */

import { NextRequest, NextResponse } from 'next/server';
import errorLogger from './error-logger';

// 错误代码枚举
export enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
}

// API错误接口
export interface ApiError {
  code: ErrorCodes;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  details?: any;
}

// 应用错误类
export class AppError extends Error {
  public readonly code: ErrorCodes;
  public readonly statusCode: number;
  public readonly timestamp: string;
  public readonly details?: any;

  constructor(
    code: ErrorCodes,
    message: string,
    statusCode: number = 500,
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    this.details = details;

    // 记录错误日志
    errorLogger.error(this, 'AppError', { code, statusCode, details });

    // 确保正确的原型链
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// 预定义错误类型
export const Errors = {
  validation: (message: string, details?: any) =>
    new AppError(ErrorCodes.VALIDATION_ERROR, message, 400, details),

  unauthorized: (message: string = '未授权访问') =>
    new AppError(ErrorCodes.UNAUTHORIZED, message, 401),

  forbidden: (message: string = '禁止访问') =>
    new AppError(ErrorCodes.FORBIDDEN, message, 403),

  notFound: (message: string = '资源不存在') =>
    new AppError(ErrorCodes.NOT_FOUND, message, 404),

  internal: (message: string = '内部服务器错误') =>
    new AppError(ErrorCodes.INTERNAL_ERROR, message, 500),

  database: (message: string = '数据库错误') =>
    new AppError(ErrorCodes.DATABASE_ERROR, message, 500),

  authentication: (message: string = '认证失败') =>
    new AppError(ErrorCodes.AUTHENTICATION_ERROR, message, 401),
};

// 错误工厂函数
export const createError = (
  code: ErrorCodes,
  message: string,
  statusCode: number = 500,
  details?: any
): AppError => {
  return new AppError(code, message, statusCode, details);
};

// 全局错误处理中间件
export const errorHandler = (error: any, context?: string): AppError => {
  // 如果已经是AppError，直接返回
  if (error instanceof AppError) {
    return error;
  }

  // 记录原始错误
  errorLogger.error(error, context || 'errorHandler');

  // 处理常见的错误类型
  if (error instanceof Error) {
    // 数据库错误
    if (
      error.message.includes('prisma') ||
      error.message.includes('database')
    ) {
      return Errors.database(error.message);
    }

    // 网络错误
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return Errors.internal('网络连接失败');
    }

    // 验证错误
    if (
      error.message.includes('validation') ||
      error.message.includes('invalid')
    ) {
      return Errors.validation(error.message);
    }

    // 默认内部错误
    return Errors.internal(error.message);
  }

  // 处理字符串错误
  if (typeof error === 'string') {
    return Errors.internal(error);
  }

  // 处理对象错误
  if (error && typeof error === 'object') {
    return Errors.internal(error.message || '未知错误');
  }

  // 未知错误类型
  return Errors.internal('发生未知错误');
};

// 错误响应格式化
export const formatErrorResponse = (error: AppError): ApiError => {
  return {
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
    timestamp: error.timestamp,
    details: error.details,
  };
};

// API错误处理包装器
export const withErrorHandling = async (
  handler: (req: NextRequest, params?: any) => Promise<NextResponse>,
  req: NextRequest,
  params?: any
): Promise<NextResponse> => {
  try {
    return await handler(req, params);
  } catch (error) {
    const appError = errorHandler(error, 'API Handler');
    return NextResponse.json(formatErrorResponse(appError), {
      status: appError.statusCode,
    });
  }
};
