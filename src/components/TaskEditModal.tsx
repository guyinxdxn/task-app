import React, { useState, useEffect } from 'react';
import type { Task } from '../app/page';

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

  return (
    <div className="w-full flex flex-col gap-4 h-full">
      <div className="flex-grow flex flex-col gap-4 min-h-0">
        <div className="flex-shrink-0">
          <label
            htmlFor="task-title-editor"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            Title
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
            Advanced Settings
          </button>
        </div>

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${showAdvanced ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="flex flex-col pt-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Auto-repeat
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onRepetitionFrequencyChange('')}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-full transition ${freq === '' ? 'bg-cyan-500 text-white' : 'bg-slate-600 hover:bg-slate-500 text-gray-300'}`}
                >
                  Off
                </button>
                <button
                  onClick={() => onRepetitionFrequencyChange('1')}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-full transition ${freq === '1' ? 'bg-cyan-500 text-white' : 'bg-slate-600 hover:bg-slate-500 text-gray-300'}`}
                >
                  Daily
                </button>
                <button
                  onClick={() => onRepetitionFrequencyChange('7')}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-full transition ${freq === '7' ? 'bg-cyan-500 text-white' : 'bg-slate-600 hover:bg-slate-500 text-gray-300'}`}
                >
                  Weekly
                </button>
                <div className="flex items-center gap-2 text-gray-300">
                  <span>Every</span>
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
                  <span>days</span>
                </div>
              </div>
            </div>
            <div>
              <label
                htmlFor="task-goal-editor"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                Goal & Status (Markdown)
              </label>
              <textarea
                id="task-goal-editor"
                value={goal}
                onChange={e => onGoalChange(e.target.value)}
                className="w-full h-32 sm:h-48 bg-gray-900/70 border border-slate-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                placeholder={`Describe the motivation behind your task using Markdown.\n\n### Status\n* Current challenges or situation...\n\n### Goal\n* The desired outcome after completing this task...`}
                disabled={isMutating}
              />
            </div>
          </div>
        </div>

        <div className="flex-grow flex flex-col gap-1 min-h-0">
          <label
            htmlFor="task-content-editor"
            className="flex-shrink-0 block text-sm font-medium text-gray-400 mb-1"
          >
            Content (Markdown)
          </label>
          <textarea
            id="task-content-editor"
            value={content}
            onChange={e => onContentChange(e.target.value)}
            className="w-full flex-grow resize-y bg-gray-900/70 border border-slate-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            aria-label="Task content editor"
            placeholder="Describe your task using Markdown...&#10;&#10;| Feature    | Status      |&#10;|------------|-------------|&#10;| Editor     | Implemented |&#10;| Preview    | Live        |"
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
  onClose: () => void;
  isMutating: boolean;
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({
  task,
  onSave,
  onClose,
  isMutating,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [goal, setGoal] = useState('');
  const [repetitionFrequency, setRepetitionFrequency] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setContent(task.content);
      setGoal(task.goal || '');
      setRepetitionFrequency(task.repetitionFrequency || '');
    }
  }, [task]);

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
            Editing:{' '}
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

        <div className="flex-shrink-0 flex justify-end gap-3 p-4 border-t border-slate-700">
          <button
            onClick={onClose}
            disabled={isMutating}
            className="px-5 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition disabled:opacity-50"
            disabled={!title.trim() || isMutating}
          >
            {isMutating ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskEditModal;
