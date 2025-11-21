'use client';
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import TaskList from '../components/WelcomeCard'; // 被重新利用的组件
import PomodoroTimer from '../components/PomodoroTimer';
import AuthForm from '../components/AuthForm';
import ErrorToast from '../components/ErrorToast';
import {
  PomodoroSettingsDrawer,
  type MusicSelection,
  type PomodoroSettings,
} from '../components/Settings';
import { useAuth } from '@/contexts/AuthContext';
import useErrorHandler from '../hooks/useErrorHandler';

// 在这里定义 Task 类型
export interface Task {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  createdAt?: string;
  repetitionFrequency?: string;
  goal?: string;
} // Define the Task type here as we can't create new files

const App: React.FC = () => {
  // 认证状态
  const { user, isLoading: authLoading, logout } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);

  // 状态管理
  const [isLoading, setIsLoading] = useState<boolean>(true); // 加载状态
  const [tasks, setTasks] = useState<Task[]>([]); // 任务列表
  const [newTaskTitle, setNewTaskTitle] = useState<string>(''); // 新任务标题输入
  const [editingTask, setEditingTask] = useState<Task | null>(null); // 正在编辑的任务
  const [isMutating, setIsMutating] = useState<boolean>(false); // 异步操作进行中状态
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [pomodoroTaskTitle, setPomodoroTaskTitle] = useState<string | null>(
    null
  );
  const [pomodoroSettings, setPomodoroSettings] = useState<PomodoroSettings>({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
  });
  const [showPomodoroSettings, setShowPomodoroSettings] = useState(false);
  const [musicSelection, setMusicSelection] = useState<MusicSelection | null>(
    null
  );

  // 使用错误处理钩子
  const { error, handleError, clearError } = useErrorHandler();

  // 加载任务的副作用钩子
  useEffect(() => {
    const loadTasksFromApi = async () => {
      if (!user) return;

      setIsLoading(true);
      clearError();

      try {
        const response = await fetch('/api/tasks');
        if (!response.ok) {
          throw new Error('Failed to load tasks');
        }
        const data = await response.json();

        // 转换API响应以匹配本地Task类型
        const transformedTasks = data.map((task: any) => ({
          id: task.id,
          title: task.title,
          content: task.content || '',
          completed: task.completed,
          createdAt: task.createdAt,
          goal: task.goal,
          repetitionFrequency:
            task.repeatType === 'daily'
              ? '1'
              : task.repeatType === 'weekly'
                ? '7'
                : task.repeatType === 'every_n_days' && task.repeatInterval
                  ? task.repeatInterval.toString()
                  : '',
        }));

        setTasks(transformedTasks);
      } catch (err) {
        handleError(err, '加载任务失败');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadTasksFromApi();
    } else {
      setIsLoading(false);
    }
  }, [user, clearError, handleError]);

  /**
   * 处理添加新任务
   */
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim() === '') return;

    setIsMutating(true);
    clearError();

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          content: '',
          completed: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const createdTask = await response.json();

      // 响应式更新：只在请求成功后更新UI
      setTasks(prev => [createdTask, ...prev]);
      setNewTaskTitle(''); // 清空输入框
    } catch (err) {
      handleError(err, '添加任务失败');
    } finally {
      setIsMutating(false);
    }
  };

  /**
   * 切换任务完成状态
   * @param id - 任务ID
   */
  const handleToggleComplete = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    setIsMutating(true);
    clearError();

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      if (!response.ok) {
        throw new Error('更新任务状态失败');
      }

      // 重新获取排序后的任务列表，确保按照新的排序规则显示
      const tasksResponse = await fetch('/api/tasks');
      if (!tasksResponse.ok) {
        throw new Error('获取任务列表失败');
      }
      const sortedTasks = await tasksResponse.json();
      
      // 更新本地任务列表为排序后的结果
      setTasks(sortedTasks);
    } catch (err) {
      handleError(err, '切换任务状态失败');
    } finally {
      setIsMutating(false);
    }
  };

  /**
   * 删除任务
   * @param id - 任务ID
   */
  const handleDeleteTask = async (id: string) => {
    setIsMutating(true);
    clearError();

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除任务失败');
      }

      // 响应式更新：只在请求成功后更新UI
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      handleError(err, '删除任务失败');
    } finally {
      setIsMutating(false);
    }
  };

  /**
   * 更新任务内容
   * @param id - 任务ID
   * @param updates - 任务更新对象
   */
  const handleUpdateTask = async (
    id: string,
    updates: Partial<Omit<Task, 'id' | 'completed'>>
  ) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    setIsMutating(true);
    clearError();

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('更新任务失败');
      }

      const updatedTask = await response.json();
      // Convert API response to match local Task type
      let repetitionFrequency = '';
      if (updatedTask.repeatType === 'daily') {
        repetitionFrequency = '1';
      } else if (updatedTask.repeatType === 'weekly') {
        repetitionFrequency = '7';
      } else if (
        updatedTask.repeatType === 'every_n_days' &&
        updatedTask.repeatInterval
      ) {
        repetitionFrequency = updatedTask.repeatInterval.toString();
      }
      // 响应式更新：只在请求成功后更新UI
      setTasks(prev =>
        prev.map(t =>
          t.id === id ? { ...updatedTask, repetitionFrequency } : t
        )
      );

      // 更新编辑任务状态
      setEditingTask(null);
    } catch (err) {
      handleError(err, '更新任务失败');
    } finally {
      setIsMutating(false);
    }
  };
  const handleStartPomodoro = (taskTitle: string) => {
    setPomodoroTaskTitle(taskTitle);
    setShowPomodoro(true);
  };
  const handleUpdatePomodoroSettings = (newSettings: PomodoroSettings) => {
    setPomodoroSettings(newSettings);
    localStorage.setItem('pomodoroSettings', JSON.stringify(newSettings));
  };

  const handleMusicSelect = (selection: MusicSelection) => {
    setMusicSelection(selection);
  };

  const handleMusicClear = () => {
    setMusicSelection(null);
  };

  /**
   * 更新任务累计时间
   * @param seconds - 要增加的秒数
   */
  const updateTaskTime = async (seconds: number) => {
    if (!pomodoroTaskTitle) return;

    // 根据任务标题找到对应的任务
    const task = tasks.find(t => t.title === pomodoroTaskTitle);
    if (!task) return;

    setIsMutating(true);
    clearError();

    try {
      // 获取当前任务的最新数据，包括当前的totalTimeSpent
      const response = await fetch(`/api/tasks/${task.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch task data');
      }
      const currentTask = await response.json();

      // 计算新的累计时间
      const currentTimeSpent = currentTask.totalTimeSpent || 0;
      const newTotalTimeSpent = currentTimeSpent + seconds;

      // 更新任务的总时间
      const updateResponse = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalTimeSpent: newTotalTimeSpent,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update task time');
      }

      const updatedTask = await updateResponse.json();

      // 更新本地任务列表
      setTasks(prev =>
        prev.map(t =>
          t.id === task.id ? { ...t, totalTimeSpent: newTotalTimeSpent } : t
        )
      );
    } catch (err) {
      handleError(err, '更新任务时间失败');
    } finally {
      setIsMutating(false);
    }
  };
  // 如果认证还在加载中，显示加载状态
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-slate-800">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-300">加载中...</h3>
          <p className="text-gray-400 mt-2">正在检查认证状态</p>
        </div>
      </div>
    );
  }

  // 如果用户未登录，显示登录/注册界面
  if (!user) {
    return (
      <AuthForm
        isLogin={isLoginMode}
        onToggleMode={() => setIsLoginMode(!isLoginMode)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-gray-900 to-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        {/* 页面标题组件 */}
        <Header title="Task Manager" user={user} onLogout={logout} />

        <main className="mt-8">
          {/* 添加任务表单 */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg p-6 mb-8">
            <form
              onSubmit={handleAddTask}
              className="flex flex-col sm:flex-row gap-4"
            >
              <input
                type="text"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="flex-grow bg-gray-900/70 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="New task title"
                disabled={isLoading || !!error || isMutating} // 加载或错误时禁用
              />
              <button
                type="submit"
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Add new task"
                disabled={
                  isLoading || !!error || !newTaskTitle.trim() || isMutating
                } // 各种禁用条件
              >
                {isMutating ? 'Adding...' : 'Add Task'}
              </button>
            </form>
          </div>

          {/* 任务列表或状态消息 */}
          {isLoading ? (
            // 加载状态显示
            <div className="bg-gray-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg p-8 text-center">
              <h3 className="text-xl font-bold text-gray-300">
                Loading Database...
              </h3>
              <p className="text-gray-400 mt-2">Getting your tasks ready.</p>
            </div>
          ) : (
            // 正常状态：显示任务列表
            <TaskList
              tasks={tasks}
              editingTask={editingTask}
              setEditingTask={setEditingTask}
              onToggleComplete={handleToggleComplete}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
              isMutating={isMutating}
              onStartPomodoro={handleStartPomodoro}
            />
          )}
        </main>
      </div>

      {/* 错误提示组件 */}
      {error && (
        <ErrorToast
          error={error}
          onClose={clearError}
        />
      )}

      {showPomodoro && (
        <PomodoroTimer
          taskTitle={pomodoroTaskTitle}
          onClose={() => {
            setShowPomodoro(false);
            setPomodoroTaskTitle(null);
          }}
          settings={pomodoroSettings}
          onOpenSettings={() => setShowPomodoroSettings(true)}
          musicSelection={musicSelection}
          updateTaskTime={updateTaskTime}
        />
      )}

      {showPomodoroSettings && (
        <PomodoroSettingsDrawer
          currentSettings={pomodoroSettings}
          onSave={handleUpdatePomodoroSettings}
          onClose={() => setShowPomodoroSettings(false)}
          currentMusic={musicSelection}
          onMusicSelect={handleMusicSelect}
          onMusicClear={handleMusicClear}
        />
      )}

      {/* 页面页脚 */}
      <footer className="fixed bottom-4 text-center text-gray-500 text-sm w-full">
        <p>A simple and elegant todo application.</p>
      </footer>
    </div>
  );
};

export default App;
