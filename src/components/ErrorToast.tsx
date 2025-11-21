'use client';

import React, { useEffect, useState } from 'react';

interface ErrorToastProps {
  error: {
    message: string;
    code?: string;
    statusCode?: number;
    timestamp: Date;
  } | null;
  onClose: () => void;
  autoHide?: boolean;
  autoHideDuration?: number;
}

const ErrorToast: React.FC<ErrorToastProps> = ({
  error,
  onClose,
  autoHide = true,
  autoHideDuration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      // 使用 setTimeout 避免在 effect 中直接调用 setState
      setTimeout(() => setIsVisible(true), 0);

      if (autoHide) {
        const timer = setTimeout(() => {
          setTimeout(() => setIsVisible(false), 0);
          setTimeout(onClose, 300); // 等待动画结束
        }, autoHideDuration);

        return () => clearTimeout(timer);
      }
    } else {
      // 使用 setTimeout 避免在 effect 中直接调用 setState
      setTimeout(() => setIsVisible(false), 0);
    }
  }, [error, autoHide, autoHideDuration, onClose]);

  if (!error || !isVisible) {
    return null;
  }

  const getErrorColor = (statusCode?: number) => {
    if (statusCode === 401 || statusCode === 403) {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    } else if (statusCode === 404) {
      return 'bg-blue-50 border-blue-200 text-blue-800';
    } else if (statusCode && statusCode >= 500) {
      return 'bg-red-50 border-red-200 text-red-800';
    }
    return 'bg-red-50 border-red-200 text-red-800';
  };

  const getErrorIcon = (statusCode?: number) => {
    if (statusCode === 401 || statusCode === 403) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    );
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div
        className={`
          transform transition-all duration-300 ease-in-out
          ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
          border rounded-lg shadow-lg p-4 ${getErrorColor(error.statusCode)}
        `}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">{getErrorIcon(error.statusCode)}</div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium">{error.message}</p>
            {error.code && (
              <p className="mt-1 text-xs opacity-75">错误代码: {error.code}</p>
            )}
            {error.statusCode && (
              <p className="mt-1 text-xs opacity-75">
                状态码: {error.statusCode}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">关闭</span>
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        {autoHide && (
          <div className="mt-2">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-current opacity-25 transition-all duration-linear"
                style={{
                  width: isVisible ? '100%' : '0%',
                  transitionDuration: `${autoHideDuration}ms`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorToast;
