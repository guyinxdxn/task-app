'use client';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  getAuthHeaders: () => { Authorization: string } | {};
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 从localStorage恢复token
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // 检查用户认证状态
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('检查认证状态失败:', error);
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  // 用户登录
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        // 提供更友好的错误消息
        const errorMessage = data.message || data.error || '登录失败';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setUser(data.user);
      
      // 从response中获取token（如果API返回）
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('auth_token', data.token);
      }
    } catch (error) {
      console.error('登录失败:', error);
      // 重新抛出错误，让调用组件处理
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 用户注册
  const register = async (email: string, name: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '注册失败');
      }

      const data = await response.json();
      setUser(data.user);
      
      // 从response中获取token（如果API返回）
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('auth_token', data.token);
      }
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 用户登出
  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
    } catch (error) {
      console.error('登出失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 获取认证headers
  const getAuthHeaders = () => {
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  };

  // 组件挂载时检查认证状态
  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    isLoading,
    token,
    login,
    register,
    logout,
    checkAuth,
    getAuthHeaders,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
