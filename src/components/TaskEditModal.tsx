import React, { useState, useEffect, useMemo } from 'react';
import type { Task } from '../app/page';


const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const FullscreenEnterIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 1v4m0 0h-4m4 0l-5-5"
    />
  </svg>
);

const FullscreenExitIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19v-4m0 0h4M15 19l-5-5M5 5v4m0 0H9m-4 0l5 5m10-14v4m0 0h-4m4 0l-5 5M5 15v4m0 0h4m-4 0l5-5"
    />
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

interface TaskEditorProps {
  title: string;
  onTitleChange: (value: string) => void;
  content: string;
  onContentChange: (value: string) => void;
  goal: string;
  onGoalChange: (value: string) => void;
  repetitionFrequency?: string;
  onRepetitionFrequencyChange: (value: string) => void;
  isMutating: boolean;
}

const TaskEditor: React.FC<TaskEditorProps> = ({
  title,
  onTitleChange,
  content,
  onContentChange,
  goal,
  onGoalChange,
  repetitionFrequency,
  onRepetitionFrequencyChange,
  isMutating,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCustomRepetitionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    if (value === '') {
      onRepetitionFrequencyChange('');
      return;
    }
    // Allow only positive integers
    if (/^[1-9]\d*$/.test(value)) {
      onRepetitionFrequencyChange(value);
    }
  };

  const freq = repetitionFrequency || '';

  const handleInsertTable = () => {
    const tableTemplate = `
| 标题 1 | 标题 2 | 标题 3 |
| :--- | :--- | :--- |
| 内容 1 | 内容 2 | 内容 3 |
`;
    const newContent = content.trim()
      ? `${content}\n${tableTemplate}`
      : tableTemplate.trim();
    onContentChange(newContent);
  };

  return (
    <div className="w-full flex flex-col gap-4 h-full">
      <div className="flex-grow flex flex-col gap-4 min-h-0">
        <div className="flex-shrink-0">
          <label
            htmlFor="task-title-editor"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            标题
          </label>
          <input
            id="task-title-editor"
            type="text"
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            className="w-full bg-gray-900/70 border border-slate-600 rounded-lg p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            aria-label="Task title editor"
            disabled={isMutating}
          />
        </div>

        <div className="flex-shrink-0">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            aria-expanded={showAdvanced}
          >
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`}
            />
            高级设置
          </button>
        </div>

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${showAdvanced ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="flex flex-col pt-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                自动重复
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onRepetitionFrequencyChange('')}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-full transition ${freq === '' ? 'bg-cyan-500 text-white' : 'bg-slate-600 hover:bg-slate-500 text-gray-300'}`}
                >
                  关闭
                </button>
                <button
                  onClick={() => onRepetitionFrequencyChange('1')}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-full transition ${freq === '1' ? 'bg-cyan-500 text-white' : 'bg-slate-600 hover:bg-slate-500 text-gray-300'}`}
                >
                  每天
                </button>
                <button
                  onClick={() => onRepetitionFrequencyChange('7')}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-full transition ${freq === '7' ? 'bg-cyan-500 text-white' : 'bg-slate-600 hover:bg-slate-500 text-gray-300'}`}
                >
                  每周
                </button>
                <div className="flex items-center gap-2 text-gray-300">
                  <span>每</span>
                  <input
                    type="number"
                    value={freq}
                    onChange={handleCustomRepetitionChange}
                    min="1"
                    step="1"
                    placeholder="n"
                    aria-label="Custom repetition days"
                    className="w-20 bg-gray-900/70 border border-slate-600 rounded-lg p-2 text-white text-center placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                  />
                  <span>天</span>
                </div>
              </div>
            </div>
            <div>
              <label
                htmlFor="task-goal-editor"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                目标与状态 (Markdown)
              </label>
              <textarea
                id="task-goal-editor"
                value={goal}
                onChange={e => onGoalChange(e.target.value)}
                className="w-full h-32 sm:h-48 bg-gray-900/70 border border-slate-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                placeholder={`描述这个任务背后的动机 (Markdown)。\n\n### 状态\n* 当前的挑战或情况...\n\n### 目标\n* 完成此任务后的期望结果...`}
                disabled={isMutating}
              />
            </div>
          </div>
        </div>

        <div className="flex-grow flex flex-col gap-1 min-h-0">
          <div className="flex justify-between items-center flex-shrink-0 mb-1">
            <label
              htmlFor="task-content-editor"
              className="block text-sm font-medium text-gray-400"
            >
              内容 (Markdown)
            </label>
            <button
              type="button"
              onClick={handleInsertTable}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-cyan-400 px-2 py-1 rounded transition-colors"
            >
              插入表格
            </button>
          </div>
          <textarea
            id="task-content-editor"
            value={content}
            onChange={e => onContentChange(e.target.value)}
            className="w-full flex-grow resize-y bg-gray-900/70 border border-slate-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            aria-label="Task content editor"
            placeholder="使用 Markdown 描述你的任务...&#10;&#10;| 功能 | 状态 |&#10;|---|---|&#10;| 编辑器 | 已实现 |&#10;| 预览 | 在线 |"
            disabled={isMutating}
          />
        </div>
      </div>
    </div>
  );
};

interface TaskEditModalProps {
  task: Task | null;
  onSave: (
    id: string,
    updates: Partial<Omit<Task, 'id' | 'completed'>>
  ) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  isMutating: boolean;
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({
  task,
  onSave,
  onDelete,
  onClose,
  isMutating,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [goal, setGoal] = useState('');
  const [repetitionFrequency, setRepetitionFrequency] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 使用 useMemo 来避免在 effect 中直接调用 setState
  const initialValues = useMemo(() => {
    if (!task) return null;
    return {
      title: task.title,
      content: task.content,
      goal: task.goal || '',
      repetitionFrequency: task.repetitionFrequency || '',
    };
  }, [task]);

  // 使用 setTimeout 避免在 effect 中直接调用 setState
  useEffect(() => {
    if (initialValues) {
      setTimeout(() => {
        setTitle(initialValues.title);
        setContent(initialValues.content);
        setGoal(initialValues.goal);
        setRepetitionFrequency(initialValues.repetitionFrequency);
      }, 0);
    }
  }, [initialValues]);

  if (!task) return null;

  const handleSave = () => {
    onSave(task.id, { title, content, goal, repetitionFrequency });
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={!isMutating ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-editor-heading"
    >
      <div
        className={`bg-slate-800 border-slate-600 shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${
          isFullscreen
            ? 'w-full h-full rounded-none border-0'
            : 'rounded-xl w-full max-w-2xl max-h-[90vh] border'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div
          className={`flex-shrink-0 flex justify-between items-center border-b border-slate-700 p-4 transition-opacity ${isMutating ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <h3
            id="task-editor-heading"
            className="text-lg font-semibold text-gray-300 truncate pr-2"
          >
            正在编辑：{' '}
            <span className="text-cyan-400 font-medium">{task.title}</span>
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-full text-gray-400 hover:bg-slate-700 hover:text-white transition-colors"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <FullscreenExitIcon className="h-5 w-5" />
              ) : (
                <FullscreenEnterIcon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:bg-slate-700 hover:text-white transition-colors"
              aria-label="Close editor"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div
          className={`flex-grow p-4 min-h-0 overflow-y-auto transition-opacity ${isMutating ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <TaskEditor
            title={title}
            onTitleChange={setTitle}
            content={content}
            onContentChange={setContent}
            goal={goal}
            onGoalChange={setGoal}
            repetitionFrequency={repetitionFrequency}
            onRepetitionFrequencyChange={setRepetitionFrequency}
            isMutating={isMutating}
          />
        </div>

        <div className="flex-shrink-0 flex justify-between gap-3 p-4 border-t border-slate-700">
          <button
            onClick={() => {
              onDelete(task.id);
              onClose();
            }}
            disabled={isMutating}
            className="px-4 py-2 bg-red-600/80 hover:bg-red-500 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center gap-2 mr-auto"
            aria-label="Delete task"
          >
            <TrashIcon className="w-5 h-5" />
            删除
          </button>

          <button
            onClick={onClose}
            disabled={isMutating}
            className="px-5 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition disabled:opacity-50"
            disabled={!title.trim() || isMutating}
          >
            {isMutating ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskEditModal;
