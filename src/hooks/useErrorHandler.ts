import { useState, useCallback } from 'react';

interface ErrorState {
  message: string;
  code?: string;
  statusCode?: number;
  timestamp: Date;
}

interface UseErrorHandlerReturn {
  error: ErrorState | null;
  clearError: () => void;
  handleError: (error: any, context?: string) => void;
  showError: (message: string, code?: string, statusCode?: number) => void;
}

const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<ErrorState | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: any, context?: string) => {
    console.error(`错误发生在: ${context || '未知上下文'}`, error);

    let errorMessage = '发生未知错误';
    let errorCode: string | undefined;
    let statusCode: number | undefined;

    // 处理不同类型的错误
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
      errorCode = error.code;
      statusCode = error.statusCode;
    } else if (error?.error) {
      // 处理API响应错误格式
      errorMessage = error.error;
      errorCode = error.code;
      statusCode = error.statusCode;
    }

    // 根据状态码提供更友好的错误消息
    if (statusCode === 401) {
      errorMessage = '登录已过期，请重新登录';
      errorCode = 'UNAUTHORIZED';
    } else if (statusCode === 403) {
      errorMessage = '没有权限执行此操作';
      errorCode = 'FORBIDDEN';
    } else if (statusCode === 404) {
      errorMessage = '请求的资源不存在';
      errorCode = 'NOT_FOUND';
    } else if (statusCode === 500) {
      errorMessage = '服务器内部错误，请稍后重试';
      errorCode = 'INTERNAL_ERROR';
    }

    // 网络错误处理
    if (error?.name === 'TypeError' && error?.message.includes('fetch')) {
      errorMessage = '网络连接失败，请检查网络连接';
      errorCode = 'NETWORK_ERROR';
    }

    setError({
      message: errorMessage,
      code: errorCode,
      statusCode,
      timestamp: new Date(),
    });

    // 在开发模式下显示详细错误信息
    if (process.env.NODE_ENV === 'development') {
      console.group('错误详情');
      console.log('上下文:', context);
      console.log('原始错误:', error);
      console.log('处理后的错误:', {
        message: errorMessage,
        code: errorCode,
        statusCode,
      });
      console.groupEnd();
    }
  }, []);

  const showError = useCallback(
    (message: string, code?: string, statusCode?: number) => {
      setError({
        message,
        code,
        statusCode,
        timestamp: new Date(),
      });
    },
    []
  );

  return {
    error,
    clearError,
    handleError,
    showError,
  };
};

export default useErrorHandler;
