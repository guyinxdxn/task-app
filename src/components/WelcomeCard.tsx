'use client';
import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import TaskEditModal from './TaskEditModal';

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

const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
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
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"
    />
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
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
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const ExpandIcon: React.FC<{ className?: string }> = ({ className }) => (
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

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

export interface Task {
  id: string;
  title: string;
  content: string;
  completed: boolean;
}

const EditableCell: React.FC<{
  value: string;
  onSave: (newValue: string) => void;
  isHeader?: boolean;
}> = ({ value, onSave, isHeader = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  // Update internal state if the external value prop changes while not editing
  useEffect(() => {
    if (!isEditing) {
      // Use setTimeout to avoid synchronous setState in useEffect
      setTimeout(() => {
        setText(value);
      }, 0);
    }
  }, [value, isEditing]);

  const handleSave = () => {
    onSave(text);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${e.target.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setText(value); // Revert changes
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="absolute inset-0 w-full h-full bg-slate-700 text-white p-2 rounded border-2 border-cyan-500 resize-none overflow-hidden z-10"
        rows={1}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`min-h-[2.5rem] p-2 cursor-pointer break-words w-full h-full flex items-center ${isHeader ? 'font-semibold text-gray-200 whitespace-nowrap' : 'whitespace-pre-wrap'}`}
    >
      {text || <span className="text-gray-500">(empty)</span>}
    </div>
  );
};

interface FullscreenTableEditorModalProps {
  task: Task;
  onSave: (id: string, title: string, content: string) => void;
  onClose: () => void;
}

const FullscreenTableEditorModal: React.FC<FullscreenTableEditorModalProps> = ({
  task,
  onSave,
  onClose,
}) => {
  const [tableData, setTableData] = useState<{
    header: { id: string; text: string }[];
    rows: { id: string; cells: string[] }[];
  } | null>(null);
  const [nonTableContent, setNonTableContent] = useState({
    before: '',
    after: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const tokens = marked.lexer(task.content);
      const tableTokenIndex = tokens.findIndex(
        (token: any) => token.type === 'table'
      );

      if (tableTokenIndex !== -1) {
        const tableToken: any = tokens[tableTokenIndex];

        const beforeTokens = tokens.slice(0, tableTokenIndex);
        const afterTokens = tokens.slice(tableTokenIndex + 1);

        const beforeContent = beforeTokens.map((t: any) => t.raw).join('');
        const afterContent = afterTokens.map((t: any) => t.raw).join('');

        // Use setTimeout to avoid synchronous setState in useEffect
        setTimeout(() => {
          setNonTableContent({ before: beforeContent, after: afterContent });

          const newHeader = tableToken.header.map((h: any, i: number) => ({
            id: `col-${Date.now()}-${i}`,
            text: h.text,
          }));

          const newRows = tableToken.rows.map((row: any[], i: number) => ({
            id: `row-${Date.now()}-${i}`,
            cells: row.map((cell: any) => cell.text),
          }));

          setTableData({ header: newHeader, rows: newRows });
        }, 0);
      }
    } catch (e) {
      console.error('Error parsing markdown for table:', e);
    }
    // Use setTimeout to avoid synchronous setState in useEffect
    setTimeout(() => {
      setIsLoading(false);
    }, 0);
  }, [task.content]);

  const handleCellUpdate = (
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    setTableData(currentData => {
      if (!currentData) return null;
      const newRows = currentData.rows.map(row => ({
        ...row,
        cells: [...row.cells],
      }));
      newRows[rowIndex].cells[colIndex] = value;
      return { ...currentData, rows: newRows };
    });
  };

  const handleHeaderUpdate = (colIndex: number, newText: string) => {
    setTableData(currentData => {
      if (!currentData) return null;
      const newHeader = [...currentData.header];
      newHeader[colIndex] = { ...newHeader[colIndex], text: newText };
      return { ...currentData, header: newHeader };
    });
  };

  const handleAddRow = () => {
    setTableData(currentData => {
      if (!currentData) return null;
      const newRow = {
        id: `row-${Date.now()}`,
        cells: Array(currentData.header.length).fill(''),
      };
      return { ...currentData, rows: [...currentData.rows, newRow] };
    });
  };

  const handleDeleteRow = (rowId: string) => {
    setTableData(currentData => {
      if (!currentData) return null;
      const newRows = currentData.rows.filter(row => row.id !== rowId);
      return { ...currentData, rows: newRows };
    });
  };

  const handleAddColumn = () => {
    setTableData(currentData => {
      if (!currentData) return null;
      const newHeaderItem = { id: `col-${Date.now()}`, text: 'New Column' };
      const newHeader = [...currentData.header, newHeaderItem];
      const newRows = currentData.rows.map(row => ({
        ...row,
        cells: [...row.cells, ''],
      }));
      return { header: newHeader, rows: newRows };
    });
  };

  const handleDeleteColumn = (colId: string) => {
    setTableData(currentData => {
      if (!currentData) return null;

      const colIndexToDelete = currentData.header.findIndex(
        h => h.id === colId
      );
      if (colIndexToDelete === -1) return currentData;

      const newHeader = currentData.header.filter(h => h.id !== colId);
      const newRows = currentData.rows.map(row => {
        const newCells = row.cells.filter((_, i) => i !== colIndexToDelete);
        return { ...row, cells: newCells };
      });
      return { header: newHeader, rows: newRows };
    });
  };

  const markdownifyTable = (
    data: { header: { text: string }[]; rows: { cells: string[] }[] } | null
  ) => {
    if (!data || data.header.length === 0) return '';
    const { header, rows } = data;

    const stringify = (arr: string[]) => `| ${arr.join(' | ')} |`;

    const headerLine = stringify(header.map(h => h.text));
    const separatorLine = stringify(header.map(() => '---'));
    const bodyLines = rows.map(row => stringify(row.cells)).join('\n');

    // Add newlines to ensure separation from other markdown content
    return `\n${[headerLine, separatorLine, bodyLines].join('\n')}\n`;
  };

  const handleSaveChanges = () => {
    const markdownTable = markdownifyTable(tableData);
    const newContent =
      `${nonTableContent.before}${markdownTable}${nonTableContent.after}`.trim();
    onSave(task.id, task.title, newContent);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex justify-between items-center border-b border-slate-600 p-4">
          <h3 className="text-xl font-semibold text-gray-300">
            Editing Table for:{' '}
            <span className="text-cyan-400 font-bold">{task.title}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-slate-700 hover:text-white transition-colors"
            aria-label="Close fullscreen editor"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-grow flex items-center justify-center text-gray-400">
            Loading table...
          </div>
        ) : !tableData ? (
          <div className="flex-grow flex items-center justify-center text-red-400 p-8 text-center">
            Could not parse a valid table from the task&apos;s content.
          </div>
        ) : (
          <div className="flex-grow p-4 overflow-y-auto">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse table-auto">
                <thead>
                  <tr className="bg-slate-700/50">
                    {tableData.header.map((headerItem, colIndex) => (
                      <th
                        key={headerItem.id}
                        className="border border-slate-600 p-0 align-top group relative"
                      >
                        <EditableCell
                          value={headerItem.text}
                          onSave={newValue =>
                            handleHeaderUpdate(colIndex, newValue)
                          }
                          isHeader={true}
                        />
                        <button
                          onClick={() => handleDeleteColumn(headerItem.id)}
                          className="absolute top-1 right-1 p-1 rounded-full text-gray-500 bg-slate-800 opacity-0 group-hover:opacity-100 hover:bg-red-500/30 hover:text-red-400 transition-opacity z-20"
                          aria-label={`Delete column: ${headerItem.text}`}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </th>
                    ))}
                    <th className="border border-slate-600 p-2 text-center align-middle w-12">
                      <button
                        onClick={handleAddColumn}
                        className="p-2 rounded-full text-gray-400 hover:bg-green-500/20 hover:text-green-400 transition-colors"
                        aria-label="Add new column"
                      >
                        <PlusIcon className="w-5 h-5" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.rows.map((rowItem, rowIndex) => (
                    <tr
                      key={rowItem.id}
                      className="hover:bg-slate-700/30 transition-colors group"
                    >
                      {rowItem.cells.map((cellText, colIndex) => (
                        <td
                          key={`${rowItem.id}-${tableData.header[colIndex]?.id || colIndex}`}
                          className="border border-slate-600 p-0 align-top relative"
                        >
                          <EditableCell
                            value={cellText}
                            onSave={newValue =>
                              handleCellUpdate(rowIndex, colIndex, newValue)
                            }
                          />
                        </td>
                      ))}
                      <td className="border border-slate-600 p-1 text-center align-middle">
                        <button
                          onClick={() => handleDeleteRow(rowItem.id)}
                          className="p-2 rounded-full text-gray-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-opacity"
                          aria-label={`Delete row ${rowIndex + 1}`}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      colSpan={tableData.header.length + 1}
                      className="p-2 text-center"
                    >
                      <button
                        onClick={handleAddRow}
                        className="w-full px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-gray-300 font-semibold rounded-lg transition"
                      >
                        + Add Row
                      </button>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        <div className="flex-shrink-0 flex justify-end gap-3 p-4 border-t border-slate-600">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={!tableData}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

interface TaskListProps {
  tasks: Task[];
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (
    id: string,
    updates: Partial<Omit<Task, 'id' | 'completed'>>
  ) => void;
  isMutating: boolean;
  onStartPomodoro: (taskTitle: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  editingTask,
  setEditingTask,
  onToggleComplete,
  onDeleteTask,
  onUpdateTask,
  isMutating,
  onStartPomodoro,
}) => {
  const [taskForFullscreen, setTaskForFullscreen] = useState<Task | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTaskForFullscreen(null);
      }
    };
    if (taskForFullscreen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [taskForFullscreen]);

  if (tasks.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg p-8 text-center">
        <h3 className="text-xl font-bold text-gray-300">No tasks yet!</h3>
        <p className="text-gray-400 mt-2">
          Add a new task above to get started.
        </p>
      </div>
    );
  }

  const renderTaskContent = (content: string) => {
    // 使用同步的 marked.parse 方法
    return DOMPurify.sanitize(marked.parse(content || '', { async: false }));
  };

  return (
    <>
      <style>{`
        .task-content table { width: 100%; margin-top: 1em; border-collapse: collapse; }
        .task-content th, .task-content td { border: 1px solid #4A5568; padding: 0.5rem 0.75rem; }
        .task-content th { background-color: #2D3748; font-weight: bold; }
        .task-content tr:nth-child(even) { background-color: #2a3344; }
        .task-content h1, .task-content h2, .task-content h3 { font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; }
        .task-content h1 { font-size: 1.5em; }
        .task-content h2 { font-size: 1.25em; }
        .task-content h3 { font-size: 1.1em; }
        .task-content p { margin-bottom: 1em; }
        .task-content ul { list-style-type: disc; margin-left: 1.5em; }
        .task-content ol { list-style-type: decimal; margin-left: 1.5em; }
        .task-content blockquote { border-left: 4px solid #4A5568; padding-left: 1em; color: #A0AEC0; margin-left: 0; }
        .task-content code { background-color: #1A202C; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; }
        .task-content pre { background-color: #1A202C; padding: 1em; border-radius: 5px; overflow-x: auto; }
        
        /* 任务项动画 */
        .task-item-enter {
          opacity: 0;
          transform: translateY(-10px);
        }
        .task-item-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 300ms ease-out, transform 300ms ease-out;
        }
        .task-item-exit {
          opacity: 1;
          transform: translateY(0);
        }
        .task-item-exit-active {
          opacity: 0;
          transform: translateY(-10px);
          transition: opacity 200ms ease-in, transform 200ms ease-in;
        }
        
        /* 状态切换动画 */
        .task-status-transition {
          transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* 复选框动画 */
        .task-checkbox {
          transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .task-checkbox-completed {
          transform: scale(1.1);
        }
        
        /* 按钮悬停动画 */
        .task-button {
          transition: all 200ms ease-in-out;
        }
        .task-button:hover {
          transform: scale(1.05);
        }
        
        /* 任务项滑入动画 */
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* 列表容器动画 */
        .task-list-container {
          transition: all 0.3s ease-in-out;
        }
      `}</style>
      <div
        className={`bg-gray-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300 ${isMutating ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="h-[45vh] sm:h-[60vh] overflow-y-auto pr-2 pb-16 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent task-list-container">
          <ul className="space-y-3">
            {tasks.map((task, index) => {
              const renderedContent = renderTaskContent(task.content);
              const hasTable = renderedContent.includes('<table>');

              return (
                <li
                  key={task.id}
                  className={`flex items-start justify-between rounded-lg task-status-transition ${
                    task.completed
                      ? 'bg-green-900/30 border-l-4 border-green-500'
                      : 'bg-slate-900/50 border-l-4 border-slate-600 hover:bg-slate-800/70'
                  }`}
                  style={{
                    animation: `slideIn 0.5s ease-out ${index * 50}ms forwards`
                  }}
                >
                  <div className="flex items-start p-4 w-full min-w-0">
                    <button
                      onClick={() => !isMutating && onToggleComplete(task.id)}
                      className={`flex-shrink-0 mt-1 w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center task-checkbox ${task.completed ? 'border-green-400 bg-green-500 task-checkbox-completed' : 'border-gray-500'}`}
                      disabled={isMutating}
                    >
                      {task.completed && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                    <p
                      className={`flex-grow pt-1 break-words truncate ${task.completed ? 'text-gray-500 line-through' : 'text-gray-100'}`}
                    >
                      {task.title}
                    </p>
                  </div>

                  <div className="p-2 flex-shrink-0 self-center flex gap-1">
                    {hasTable && (
                      <button
                        onClick={() =>
                          !isMutating && setTaskForFullscreen(task)
                        }
                        disabled={isMutating}
                        className="p-2 rounded-full text-gray-500 hover:bg-purple-500/20 hover:text-purple-400 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`View and edit table in task: ${task.title}`}
                      >
                        <ExpandIcon className="h-6 w-6" />
                      </button>
                    )}
                    <button
                      onClick={() => onStartPomodoro(task.title)}
                      className="p-2 text-gray-400 hover:text-cyan-400 transition-colors rounded-full hover:bg-slate-600/50 disabled:opacity-50"
                      aria-label={`Start pomodoro for ${task.title}`}
                      disabled={isMutating}
                    >
                      <ClockIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => !isMutating && setEditingTask(task)}
                      disabled={isMutating}
                      className="p-2 rounded-full text-gray-500 hover:bg-blue-500/20 hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={`Edit task: ${task.title}`}
                    >
                      <EditIcon className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => !isMutating && onDeleteTask(task.id)}
                      disabled={isMutating}
                      className="p-2 rounded-full text-gray-500 hover:bg-red-500/20 hover:text-red-400 task-button focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={`Delete task: ${task.title}`}
                    >
                      <TrashIcon className="h-6 w-6" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <TaskEditModal
        task={editingTask}
        onSave={onUpdateTask}
        onClose={() => setEditingTask(null)}
        isMutating={isMutating}
      />

      {taskForFullscreen && (
        <FullscreenTableEditorModal
          task={taskForFullscreen}
          onSave={(id, title, content) => {
            onUpdateTask(id, { title, content });
            setTaskForFullscreen(null);
          }}
          onClose={() => setTaskForFullscreen(null)}
        />
      )}
    </>
  );
};

export default TaskList;
