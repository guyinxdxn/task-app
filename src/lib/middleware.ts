import { NextRequest } from 'next/server';
import { verifyToken } from './auth';

export interface AuthenticatedRequest extends NextRequest {
  userId?: string;
}

/**
 * 认证中间件
 * 验证JWT token并设置userId到请求对象中
 * 支持两种认证方式：
 * 1. Cookie中的token（浏览器环境自动传递）
 * 2. Authorization header中的Bearer token（移动端或特殊场景）
 */
export const withAuth = (
  handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<Response>
) => {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      let token: string | undefined;

      // 首先尝试从Authorization header获取token
      const authHeader = req.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }

      // 如果没有Authorization header，尝试从cookie获取
      if (!token) {
        token = req.cookies.get('token')?.value;
      }

      if (!token) {
        return new Response(JSON.stringify({ error: '未授权访问' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 验证token
      const decoded = verifyToken(token);
      if (!decoded) {
        return new Response(JSON.stringify({ error: '无效的token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 创建认证请求对象
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.userId = decoded.userId;

      return handler(authenticatedReq, ...args);
    } catch (error) {
      console.error('认证中间件错误:', error);
      return new Response(JSON.stringify({ error: '认证失败' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
};
