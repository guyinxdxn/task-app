'use client';
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ErrorToast from './ErrorToast';
import useErrorHandler from '../hooks/useErrorHandler';

interface AuthFormProps {
  isLogin?: boolean;
  onToggleMode?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({
  isLogin = true,
  onToggleMode,
}) => {
  const { login, register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  });

  // 使用错误处理钩子
  const { error, handleError, clearError } = useErrorHandler();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // 验证表单
    if (!formData.email || !formData.password) {
      handleError(new Error('邮箱和密码都是必填项'), '表单验证失败');
      return;
    }

    if (!isLogin && !formData.name) {
      handleError(new Error('姓名是必填项'), '表单验证失败');
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      handleError(new Error('两次输入的密码不一致'), '表单验证失败');
      return;
    }

    if (formData.password.length < 6) {
      handleError(new Error('密码长度至少为6位'), '表单验证失败');
      return;
    }

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.name, formData.password);
      }
    } catch (err) {
      handleError(err, isLogin ? '登录失败' : '注册失败');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-slate-800 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">
            {isLogin ? '登录' : '注册'}
          </h2>
          <p className="mt-2 text-gray-400">
            {isLogin ? '登录您的账户' : '创建新账户'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="sr-only">
                  姓名
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required={!isLogin}
                  className="relative block w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="姓名"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="sr-only">
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="relative block w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="邮箱地址"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="密码"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  确认密码
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required={!isLogin}
                  className="relative block w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="确认密码"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-cyan-600 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '处理中...' : isLogin ? '登录' : '注册'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onToggleMode}
              className="text-cyan-400 hover:text-cyan-300 text-sm"
            >
              {isLogin ? '没有账户？立即注册' : '已有账户？立即登录'}
            </button>
          </div>
        </form>

        {/* 错误提示组件 */}
        {error && (
          <ErrorToast
            error={error}
            onClose={clearError}
          />
        )}
      </div>
    </div>
  );
};

export default AuthForm;