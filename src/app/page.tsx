"use client";
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import TaskList from '../components/WelcomeCard'; // 被重新利用的组件

// 在这里定义 Task 类型，因为我们不能创建新文件
export interface Task {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  createdAt?: string;
}

const App: React.FC = () => {
  // 状态管理
  const [isLoading, setIsLoading] = useState<boolean>(true); // 加载状态
  const [error, setError] = useState<string | null>(null); // 错误信息
  const [tasks, setTasks] = useState<Task[]>([]); // 任务列表
  const [newTaskTitle, setNewTaskTitle] = useState<string>(''); // 新任务标题输入
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null); // 正在编辑的任务ID

  // 加载任务的副作用钩子
  useEffect(() => {
    loadTasksFromApi();
  }, []); // 空依赖数组表示只在组件挂载时运行一次

  /**
   * 从 API 加载任务列表
   */
  const loadTasksFromApi = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      // 将 API 数据转换为 Task 对象数组
      const apiTasks = data.map((task: any) => ({
        id: task.id,
        title: task.title,
        content: task.content || '',
        completed: task.completed,
        createdAt: task.createdAt
      }));
      setTasks(apiTasks);
      setError(null);
    } catch (err) {
      console.error("加载任务失败:", err);
      setError("获取任务时发生错误。");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 处理添加新任务
   * @param e - 表单提交事件
   */
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim() === '') return;

    const originalTasks = [...tasks];
    const tempId = `temp-${Date.now()}`;
    
    // 乐观更新：立即在界面上显示新任务
    const newTask: Task = {
      id: tempId,
      title: newTaskTitle,
      content: '',
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle(''); // 清空输入框

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTaskTitle,
          content: ''
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const createdTask = await response.json();
      
      // 用服务器返回的真实ID替换临时ID
      setTasks(prev => prev.map(task => 
        task.id === tempId ? { ...createdTask } : task
      ));
      
    } catch (err) {
      console.error("添加任务失败:", err);
      setError("创建任务时发生错误。");
      // 回滚到原始状态
      setTasks(originalTasks);
    }
  };

  /**
   * 切换任务完成状态
   * @param id - 任务ID
   */
  const handleToggleComplete = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const originalTasks = [...tasks];
    const newCompletedState = !task.completed;
    
    // 乐观更新：立即在界面上更新任务状态
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: newCompletedState } : t
    ));

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: newCompletedState
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      
      // 用服务器返回的数据更新任务
      setTasks(prev => prev.map(t => 
        t.id === id ? { ...updatedTask } : t
      ));
      
    } catch (err) {
      console.error("更新任务失败:", err);
      setError("更新任务时发生错误。");
      // 回滚到原始状态
      setTasks(originalTasks);
    }
  };

  /**
   * 删除任务
   * @param id - 要删除的任务ID
   */
  const handleDeleteTask = async (id: string) => {
    const originalTasks = [...tasks];
    
    // 乐观更新：立即从界面上移除任务
    setTasks(prev => prev.filter(task => task.id !== id));

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      // 删除成功，不需要额外操作
      
    } catch (err) {
      console.error("删除任务失败:", err);
      setError("删除任务时发生错误。");
      // 回滚到原始状态
      setTasks(originalTasks);
    }
  };
  
  /**
   * 更新任务内容
   * @param id - 任务ID
   * @param title - 新标题
   * @param content - 新内容
   */
  const handleUpdateTask = async (id: string, title: string, content: string) => {
    const originalTasks = [...tasks];
    
    // 乐观更新：立即在界面上更新任务内容
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, title, content } : task
    ));
    setEditingTaskId(null); // 退出编辑模式

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      
      // 用服务器返回的数据更新任务
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...updatedTask } : task
      ));
      
    } catch (err) {
      console.error("更新任务失败:", err);
      setError("更新任务时发生错误。");
      // 回滚到原始状态
      setTasks(originalTasks);
      setEditingTaskId(id); // 保持编辑模式以便用户重试
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-gray-900 to-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        {/* 页面标题组件 */}
        <Header title="Task Manager" />
        
        <main className="mt-8">
          {/* 添加任务表单 */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg p-6 mb-8">
            <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="flex-grow bg-gray-900/70 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition disabled:opacity-50"
                aria-label="New task title"
                disabled={isLoading || !!error} // 加载或错误时禁用
              />
              <button
                type="submit"
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Add new task"
                disabled={isLoading || !!error || !newTaskTitle.trim()} // 各种禁用条件
              >
                Add Task
              </button>
            </form>
          </div>

          {/* 任务列表或状态消息 */}
          {isLoading ? (
            // 加载状态显示
            <div className="bg-gray-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg p-8 text-center">
              <h3 className="text-xl font-bold text-gray-300">Loading Database...</h3>
              <p className="text-gray-400 mt-2">Getting your tasks ready.</p>
            </div>
          ) : error ? (
            // 错误状态显示
            <div className="bg-red-900/50 border border-red-700 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-red-300">An Error Occurred</h3>
              <p className="text-red-400 mt-2">{error}</p>
            </div>
          ) : (
            // 正常状态：显示任务列表
            <TaskList
              tasks={tasks}
              editingTaskId={editingTaskId}
              setEditingTaskId={setEditingTaskId}
              onToggleComplete={handleToggleComplete}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
            />
          )}
        </main>
      </div>
      
      {/* 页面页脚 */}
      <footer className="fixed bottom-4 text-center text-gray-500 text-sm w-full">
        <p>A simple and elegant todo application.</p>
      </footer>
    </div>
  );
};

export default App;