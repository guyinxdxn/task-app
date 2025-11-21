import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { MusicSelection, PomodoroSettings } from './Settings';

// --- 图标组件 ---

// 【新增】设置图标
const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
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
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

// 【新增】进入全屏图标
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

// 【新增】退出全屏图标
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

// 重置图标
const ResetIcon: React.FC<{ className?: string }> = ({ className }) => (
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
      d="M4 4v5h5m-5 0a9 9 0 0014.08 5.42M20 20v-5h-5m5 0a9 9 0 00-14.08-5.42"
    />
  </svg>
);
// 关闭图标
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

// --- 组件 Props 定义 ---
interface PomodoroTimerProps {
  onClose: () => void;
  taskTitle: string | null;
  settings: PomodoroSettings;
  onOpenSettings?: () => void;
  musicSelection: MusicSelection | null;
  updateTaskTime?: (seconds: number) => Promise<void>; // 更新任务累计时间的回调函数
}

// --- 定时器模式类型 ---
type Mode = 'pomodoro' | 'shortBreak' | 'longBreak' | 'test';

// --- 番茄钟主组件 ---
const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  onClose,
  taskTitle,
  settings,
  onOpenSettings,
  musicSelection,
  updateTaskTime,
}) => {
  // =================================================================
  // === 状态管理 (State Management)
  // =================================================================

  const pomodoroTime = settings.pomodoro * 60;
  const shortBreakTime = settings.shortBreak * 60;
  const longBreakTime = settings.longBreak * 60;
  const [testTime] = useState(2);

  const [mode, setMode] = useState<Mode>('pomodoro');
  const [lastWorkMode, setLastWorkMode] = useState<Mode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(pomodoroTime);
  const [isActive, setIsActive] = useState(false);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showCloseConfirmDialog, setShowCloseConfirmDialog] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false); // 提交状态，防止重复提交

  const [musicURL, setMusicURL] = useState<string | null>(null);
  const [isAudioReady, setIsAudioReady] = useState(false);

  // =================================================================
  // === Refs (用于引用DOM元素或存储持久化变量)
  // =================================================================

  const audioContextRef = useRef<AudioContext | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);

  // =================================================================
  // === 核心逻辑与副作用 (Core Logic & Effects)
  // =================================================================

  /**
   * 格式化秒为 HH:MM:SS 或 MM:SS 格式的字符串
   */
  const formatTime = (seconds: number) => {
    if (seconds < 0) seconds = 0;

    const hours = Math.floor(seconds / 3600);
    const remainingSecondsAfterHours = seconds % 3600;
    const mins = Math.floor(remainingSecondsAfterHours / 60)
      .toString()
      .padStart(2, '0');
    const secs = (remainingSecondsAfterHours % 60).toString().padStart(2, '0');

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins}:${secs}`;
    }

    return `${mins}:${secs}`;
  };

  /**
   * 切换定时器模式的函数
   */
  const switchMode = useCallback(
    (newMode: Mode) => {
      setIsActive(false);
      setMode(newMode);
      if (newMode === 'pomodoro' || newMode === 'test') {
        setLastWorkMode(newMode);
      }
      if (newMode === 'pomodoro') {
        setTimeLeft(pomodoroTime);
      } else if (newMode === 'shortBreak') {
        setTimeLeft(shortBreakTime);
      } else if (newMode === 'longBreak') {
        setTimeLeft(longBreakTime);
      } else {
        setTimeLeft(testTime);
      }
    },
    [pomodoroTime, shortBreakTime, longBreakTime, testTime]
  );

  /**
   * 初始化 Web Audio API 的 AudioContext
   */
  useEffect(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      } catch (e) {
        console.error('Web Audio API is not supported in this browser.');
      }
    }
  }, []);

  /**
   * 处理定时器的核心倒计时逻辑
   */
  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      if (endTimeRef.current) {
        const remainingSeconds = Math.round(
          (endTimeRef.current - Date.now()) / 1000
        );
        setTimeLeft(remainingSeconds >= 0 ? remainingSeconds : 0);
      }
    }, 250);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive]);

  /**
   * 处理计时器完成时的逻辑
   */
  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      if (audioContextRef.current) {
        const playTone = async () => {
          try {
            const audioCtx = audioContextRef.current!;
            if (audioCtx.state === 'suspended') {
              await audioCtx.resume();
            }

            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);

            gainNode.gain.linearRampToValueAtTime(
              0.5,
              audioCtx.currentTime + 0.05
            );
            gainNode.gain.linearRampToValueAtTime(
              0,
              audioCtx.currentTime + 0.4
            );

            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.5);
          } catch (error) {
            console.error('Error playing notification sound:', error);
            if (navigator.vibrate) navigator.vibrate(200);
          }
        };
        playTone();
      } else {
        if (navigator.vibrate) navigator.vibrate(200);
      }

      setIsActive(false);
      setShowCompletionDialog(true);
    }
  }, [isActive, timeLeft]);

  /**
   * 同步来自父组件的设置更改
   */
  useEffect(() => {
    if (isActive) {
      setIsActive(false);
    }

    switch (mode) {
      case 'pomodoro':
        setTimeLeft(settings.pomodoro * 60);
        break;
      case 'shortBreak':
        setTimeLeft(settings.shortBreak * 60);
        break;
      case 'longBreak':
        setTimeLeft(settings.longBreak * 60);
        break;
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  /**
   * 更新浏览器标签页标题
   */
  useEffect(() => {
    document.title = `${formatTime(timeLeft)} - ${mode}`;
    return () => {
      document.title = 'Task Management System';
    };
  }, [timeLeft, mode]);

  /**
   * 管理背景音乐文件的 URL
   */
  useEffect(() => {
    if (musicSelection) {
      if (musicSelection.type === 'custom') {
        const objectURL = URL.createObjectURL(musicSelection.file);
        setMusicURL(objectURL);

        return () => {
          URL.revokeObjectURL(objectURL);
        };
      } else {
        // type is 'default'
        setMusicURL(musicSelection.url);
      }
    } else {
      setMusicURL(null);
    }
  }, [musicSelection]);

  /**
   * 控制背景音乐的播放与暂停
   */
  useEffect(() => {
    const audioEl = musicAudioRef.current;
    if (!audioEl) return;

    if (isActive && musicURL && isAudioReady) {
      audioEl.play().catch(error => {
        // This can happen if the play request is interrupted by a new one
        // or if the user hasn't interacted with the page yet.
        console.error('Background music play failed:', error);
      });
    } else {
      audioEl.pause();
    }
  }, [isActive, musicURL, isAudioReady]);

  // =================================================================
  // === 事件处理器 (Event Handlers)
  // =================================================================

  /**
   * 处理关闭请求
   */
  const handleCloseAttempt = () => {
    if (isActive) {
      setShowCloseConfirmDialog(true);
    } else {
      onClose();
    }
  };

  /**
   * 处理全屏/退出全屏按钮点击
   */
  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  /**
   * 处理开始/暂停按钮点击
   */
  const handleStartPause = () => {
    if (
      audioContextRef.current &&
      audioContextRef.current.state === 'suspended'
    ) {
      audioContextRef.current
        .resume()
        .catch(e => console.error('AudioContext resume failed:', e));
    }

    const newIsActive = !isActive;

    if (newIsActive) {
      endTimeRef.current = Date.now() + timeLeft * 1000;
    } else {
      endTimeRef.current = null;
    }

    setIsActive(newIsActive);
  };

  /**
   * 处理重置按钮点击
   */
  const handleReset = () => {
    switchMode(mode);
  };

  /**
   * 处理“提交会话”按钮点击
   */
  const handleCommitSession = async () => {
    // 防止重复提交
    if (isCommitting) {
      return;
    }

    setIsCommitting(true);

    try {
      if (mode === 'pomodoro' || mode === 'test') {
        const newCompleted = pomodorosCompleted + 1;
        setPomodorosCompleted(newCompleted);

        // 当处于工作模式且有任务标题和updateTaskTime回调时，更新累计时间
        if (taskTitle && updateTaskTime) {
          const sessionDuration =
            mode === 'pomodoro' ? settings.pomodoro * 60 : testTime;
          try {
            await updateTaskTime(sessionDuration);
          } catch (error) {
            console.error('Failed to update task time:', error);
          }
        }

        if (newCompleted % 4 === 0) {
          switchMode('longBreak');
        } else {
          switchMode('shortBreak');
        }
      } else {
        switchMode(lastWorkMode);
      }
      setShowCompletionDialog(false);
    } finally {
      setIsCommitting(false);
    }
  };

  // =================================================================
  // === 辅助函数 (Helper Functions)
  // =================================================================

  /**
   * 计算当前进度百分比
   */
  const progressPercentage = () => {
    let totalTime;
    if (mode === 'pomodoro') totalTime = pomodoroTime;
    else if (mode === 'shortBreak') totalTime = shortBreakTime;
    else if (mode === 'longBreak') totalTime = longBreakTime;
    else totalTime = testTime;

    // 确保 totalTime 和 timeLeft 是有效数字
    if (typeof totalTime !== 'number' || isNaN(totalTime) || totalTime <= 0)
      return 0;
    if (typeof timeLeft !== 'number' || isNaN(timeLeft)) return 0;

    const progress = ((totalTime - timeLeft) / totalTime) * 100;
    // 确保进度值在 0-100 范围内
    return Math.max(0, Math.min(100, progress));
  };

  const modeColors = {
    pomodoro: 'from-red-500 to-orange-500',
    shortBreak: 'from-cyan-500 to-blue-500',
    longBreak: 'from-indigo-500 to-purple-500',
    test: 'from-green-500 to-emerald-500',
  };

  const gradientStops = {
    pomodoro: { start: '#ef4444', end: '#f97316' },
    shortBreak: { start: '#06b6d4', end: '#3b82f6' },
    longBreak: { start: '#6366f1', end: '#8b5cf6' },
    test: { start: '#22c55e', end: '#10b981' },
  };

  /**
   * 返回完成对话框中的提示信息
   */
  const completionMessage = () => {
    if (mode === 'pomodoro' || mode === 'test') {
      return 'Great work! Time for a well-deserved break.';
    }
    return "Break's over! Ready for the next session?";
  };

  const formattedTime = formatTime(timeLeft);
  const timeDisplayClass = `absolute font-bold tracking-tighter text-white ${
    formattedTime.length > 5 ? 'text-5xl sm:text-6xl' : 'text-6xl sm:text-7xl'
  }`;

  // =================================================================
  // === 渲染 (Render)
  // =================================================================
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleCloseAttempt}
    >
      {/* 模态框主体 */}
      <div
        className={`bg-slate-800 border border-slate-600 shadow-2xl flex flex-col items-center relative transition-all duration-300 ${
          isFullscreen
            ? 'p-4 sm:p-8 gap-4 sm:gap-6 w-full h-full rounded-none sm:rounded-xl sm:max-w-4xl sm:max-h-[95vh]'
            : 'p-8 gap-6 rounded-xl w-full max-w-md'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* 关闭与全屏按钮容器 */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-full text-gray-400 hover:bg-slate-700 hover:text-white transition-colors"
              aria-label="Open settings"
            >
              <SettingsIcon className="h-6 w-6" />
            </button>
          )}
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-full text-gray-400 hover:bg-slate-700 hover:text-white transition-colors"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <FullscreenExitIcon className="h-6 w-6" />
            ) : (
              <FullscreenEnterIcon className="h-6 w-6" />
            )}
          </button>
          <button
            onClick={handleCloseAttempt}
            className="p-2 rounded-full text-gray-400 hover:bg-slate-700 hover:text-white transition-colors"
            aria-label="Close pomodoro timer"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        {/* 标题 */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-200">Pomodoro Timer</h2>
          {taskTitle && (
            <p className="text-cyan-400 mt-1 truncate" title={taskTitle}>
              Focusing on: {taskTitle}
            </p>
          )}
        </div>

        {/* 模式选择按钮 */}
        <div className="flex gap-2 bg-slate-700/50 p-1.5 rounded-full flex-wrap justify-center">
          <button
            onClick={() => switchMode('pomodoro')}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition ${mode === 'pomodoro' ? 'bg-slate-900 text-white' : 'text-gray-400 hover:bg-slate-600/50'}`}
          >
            Work
          </button>
          <button
            onClick={() => switchMode('shortBreak')}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition ${mode === 'shortBreak' ? 'bg-slate-900 text-white' : 'text-gray-400 hover:bg-slate-600/50'}`}
          >
            Short Break
          </button>
          <button
            onClick={() => switchMode('longBreak')}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition ${mode === 'longBreak' ? 'bg-slate-900 text-white' : 'text-gray-400 hover:bg-slate-600/50'}`}
          >
            Long Break
          </button>
          <button
            onClick={() => switchMode('test')}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition ${mode === 'test' ? 'bg-slate-900 text-white' : 'text-gray-400 hover:bg-slate-600/50'}`}
          >
            Test
          </button>
        </div>

        {/* 圆形进度条和时间显示 */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-slate-700"
              strokeWidth="7"
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
            />
            <circle
              className="transform -rotate-90 origin-center transition-all duration-500"
              strokeWidth="7"
              strokeDasharray="283"
              strokeDashoffset={283 - (progressPercentage() / 100) * 283}
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="url(#gradient)"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={gradientStops[mode].start} />
                <stop offset="100%" stopColor={gradientStops[mode].end} />
              </linearGradient>
            </defs>
          </svg>
          <time className={timeDisplayClass}>{formattedTime}</time>
        </div>

        {/* 控制按钮 */}
        <div className="flex gap-4">
          <button
            onClick={handleStartPause}
            className={`w-32 px-6 py-3 text-white font-bold rounded-lg shadow-lg text-lg transition-transform transform hover:scale-105 bg-gradient-to-r ${modeColors[mode]}`}
          >
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={handleReset}
            className="p-4 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-gray-300 transition"
            aria-label="Reset timer"
          >
            <ResetIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="h-10 mt-4">
          {/* 已完成番茄钟计数器 */}
          <div className="text-gray-400 text-sm text-center">
            Pomodoros Completed:{' '}
            <span className="font-bold text-white">{pomodorosCompleted}</span>
          </div>
        </div>

        {/* 隐藏的 audio 元素，用于播放背景音乐 */}
        {musicURL && (
          <audio
            ref={musicAudioRef}
            src={musicURL}
            loop
            onCanPlay={() => setIsAudioReady(true)}
            onLoadStart={() => setIsAudioReady(false)}
            onError={e => console.error('Background music element error:', e)}
          />
        )}

        {/* 完成对话框 (条件渲染) */}
        {showCompletionDialog && (
          <div className="absolute inset-0 bg-slate-800/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 rounded-xl text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              Time&apos;s Up!
            </h3>
            <p className="text-gray-300 mb-8">{completionMessage()}</p>
            <button
              onClick={handleCommitSession}
              disabled={isCommitting}
              className={`px-8 py-4 text-white font-bold rounded-lg shadow-lg text-lg transition-transform transform hover:scale-105 bg-gradient-to-r ${modeColors[mode]} ${
                isCommitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isCommitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Committing...
                </span>
              ) : (
                'Commit Session'
              )}
            </button>
          </div>
        )}

        {/* 【新增】退出确认对话框 (条件渲染) */}
        {showCloseConfirmDialog && (
          <div className="absolute inset-0 bg-slate-800/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 rounded-xl text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              Confirm Exit?
            </h3>
            <p className="text-gray-300 mb-8">
              The timer is still running. Are you sure you want to quit?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCloseConfirmDialog(false)}
                className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-lg shadow-lg text-lg transition-transform transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className={`px-6 py-3 text-white font-bold rounded-lg shadow-lg text-lg transition-transform transform hover:scale-105 bg-gradient-to-r from-red-600 to-rose-600`}
              >
                Confirm Exit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PomodoroTimer;
