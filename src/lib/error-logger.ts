// 错误日志记录器
interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  code?: string;
  statusCode?: number;
  stack?: string;
  context?: string;
  userId?: string;
  url?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

class ErrorLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // 最大日志数量

  // 记录错误
  error(
    error: Error | string,
    context?: string,
    metadata?: Record<string, any>
  ) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message: typeof error === 'string' ? error : error.message,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      metadata,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    };

    this.addLog(logEntry);
    this.sendToServer(logEntry);
    this.consoleLog(logEntry);
  }

  // 记录警告
  warn(message: string, context?: string, metadata?: Record<string, any>) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context,
      metadata,
    };

    this.addLog(logEntry);
    this.consoleLog(logEntry);
  }

  // 记录信息
  info(message: string, context?: string, metadata?: Record<string, any>) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context,
      metadata,
    };

    this.addLog(logEntry);
    this.consoleLog(logEntry);
  }

  // 记录API错误
  logApiError(
    error: any,
    endpoint: string,
    method: string,
    statusCode?: number
  ) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message: error?.message || 'API请求失败',
      code: error?.code,
      statusCode,
      context: `API: ${method} ${endpoint}`,
      metadata: {
        endpoint,
        method,
        statusCode,
        errorDetails: error,
      },
    };

    this.addLog(logEntry);
    this.sendToServer(logEntry);
    this.consoleLog(logEntry);
  }

  // 添加日志到内存
  private addLog(logEntry: LogEntry) {
    this.logs.push(logEntry);

    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // 在开发模式下，也保存到localStorage以便调试
    if (
      process.env.NODE_ENV === 'development' &&
      typeof window !== 'undefined'
    ) {
      try {
        const storedLogs = localStorage.getItem('app-error-logs');
        const logs = storedLogs ? JSON.parse(storedLogs) : [];
        logs.push(logEntry);

        // 限制存储的日志数量
        if (logs.length > 100) {
          logs.splice(0, logs.length - 100);
        }

        localStorage.setItem('app-error-logs', JSON.stringify(logs));
      } catch (e) {
        console.warn('无法保存日志到localStorage:', e);
      }
    }
  }

  // 发送到服务器（生产环境）
  private sendToServer(logEntry: LogEntry) {
    if (process.env.NODE_ENV === 'production') {
      // 在实际应用中，这里可以发送到错误监控服务
      // 例如：Sentry, LogRocket, 或自定义的错误收集服务

      // 模拟发送到服务器
      if (typeof window !== 'undefined' && 'fetch' in window) {
        fetch('/api/logs/error', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(logEntry),
        }).catch(() => {
          // 静默失败，不阻塞应用
        });
      }
    }
  }

  // 控制台输出
  private consoleLog(logEntry: LogEntry) {
    const { level, message, context, ...rest } = logEntry;
    const contextStr = context ? `[${context}]` : '';

    switch (level) {
      case 'error':
        console.error(`${contextStr} ${message}`, rest);
        break;
      case 'warn':
        console.warn(`${contextStr} ${message}`, rest);
        break;
      case 'info':
        console.info(`${contextStr} ${message}`, rest);
        break;
    }
  }

  // 获取日志
  getLogs(level?: LogEntry['level']): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  // 清空日志
  clearLogs() {
    this.logs = [];

    if (
      process.env.NODE_ENV === 'development' &&
      typeof window !== 'undefined'
    ) {
      localStorage.removeItem('app-error-logs');
    }
  }

  // 获取日志统计
  getStats() {
    const errors = this.logs.filter(log => log.level === 'error').length;
    const warnings = this.logs.filter(log => log.level === 'warn').length;
    const infos = this.logs.filter(log => log.level === 'info').length;

    return {
      total: this.logs.length,
      errors,
      warnings,
      infos,
      lastError: this.logs.find(log => log.level === 'error'),
      lastWarning: this.logs.find(log => log.level === 'warn'),
    };
  }
}

// 创建全局实例
const errorLogger = new ErrorLogger();

export default errorLogger;
