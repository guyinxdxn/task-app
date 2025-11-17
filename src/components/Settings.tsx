import React, { useState, useEffect, useRef } from 'react';

// =================================================================
// === 类型定义 (Type Definitions)
// =================================================================

/**
 * 定义音乐选择的类型。
 * 'default': 使用预设的音乐URL。
 * 'custom': 使用用户上传的本地文件。
 */
export type MusicSelection =
  | { type: 'default'; name: string; url: string }
  | { type: 'custom'; file: File };

/**
 * 定义番茄钟设置的接口。
 */
export interface PomodoroSettings {
  pomodoro: number; // 工作时长（分钟）
  shortBreak: number; // 短休息时长（分钟）
  longBreak: number; // 长休息时长（分钟）
}

// =================================================================
// === 图标组件 (Icon Components)
// =================================================================

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

// 音乐图标
const MusicIcon: React.FC<{ className?: string }> = ({ className }) => (
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
      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-13c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"
    />
  </svg>
);

// 播放图标
const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
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
      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// 暂停图标
const PauseIcon: React.FC<{ className?: string }> = ({ className }) => (
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
      d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// =================================================================
// === 音乐选择弹窗 (Music Selection Modal)
// =================================================================

// 预设的背景音乐列表
const DEFAULT_MUSIC = [
  {
    name: 'Peaceful Piano',
    url: 'https://ice1.somafm.com/groovesalad-128.mp3',
  },
  {
    name: 'Gentle Waves',
    url: 'https://cdn.pixabay.com/audio/2024/05/13/audio_1f248f2193.mp3',
  },
  {
    name: 'Cafe Ambience',
    url: 'https://cdn.pixabay.com/audio/2022/02/07/audio_c68cceb887.mp3',
  },
];

interface MusicSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMusic: (selection: MusicSelection | null) => void;
  currentMusic: MusicSelection | null;
}

const MusicSelectionModal: React.FC<MusicSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectMusic,
  currentMusic,
}) => {
  // --- 状态与 Refs ---
  const musicInputRef = useRef<HTMLInputElement>(null); // 引用文件上传输入框
  const previewAudioRef = useRef<HTMLAudioElement | null>(null); // 引用用于预览的 Audio 元素实例
  const [playingPreviewUrl, setPlayingPreviewUrl] = useState<string | null>(
    null
  ); // 当前正在预览的音乐URL
  const [isVisible, setIsVisible] = useState(false); // 控制弹窗的显示/隐藏（用于动画）
  const listenersRef = useRef<{ onCanPlay?: () => void; onError?: () => void }>(
    {}
  ); // 引用事件监听器，用于清理
  const [customMusicUrl, setCustomMusicUrl] = useState<string | null>(null); // 【新增】为自定义音乐文件创建的预览URL

  // --- 副作用 (Effects) ---

  // 【新增】当自定义音乐文件变化时，为其创建或撤销一个可预览的URL
  useEffect(() => {
    let objectUrl: string | null = null;
    // 当 currentMusic 是一个自定义文件时，为其创建一个临时的URL用于预览
    if (currentMusic?.type === 'custom') {
      objectUrl = URL.createObjectURL(currentMusic.file);
      setCustomMusicUrl(objectUrl);
    } else {
      // 如果不是自定义文件，或音乐被清空，则重置URL
      setCustomMusicUrl(null);
    }

    // 清理函数，在组件卸载或文件改变时撤销URL
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [currentMusic]);

  // 控制弹窗的淡入淡出动画
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // 初始化并清理 Audio 元素实例
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous'; // 允许跨域音频
    previewAudioRef.current = audio;

    // 监听播放结束事件，自动重置播放状态
    const handleEnded = () => setPlayingPreviewUrl(null);
    audio.addEventListener('ended', handleEnded);

    // 组件卸载时，暂停播放并移除所有监听器
    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleEnded);
      const { onCanPlay, onError } = listenersRef.current;
      if (onCanPlay) audio.removeEventListener('canplaythrough', onCanPlay);
      if (onError) audio.removeEventListener('error', onError);
    };
  }, []);

  // 当弹窗隐藏时，停止任何正在播放的预览
  useEffect(() => {
    if (!isVisible) {
      previewAudioRef.current?.pause();
      setPlayingPreviewUrl(null);
    }
  }, [isVisible]);

  // --- 事件处理器 (Event Handlers) ---

  /**
   * 处理音乐预览的播放/暂停。
   * 这是最复杂的部分，它使用事件监听器来避免竞态条件。
   */
  const handlePlayPreview = (url: string) => {
    const audio = previewAudioRef.current;
    if (!audio) return;

    // 1. 清理上一个音轨的旧监听器，防止内存泄漏或意外触发
    const { onCanPlay: oldOnCanPlay, onError: oldOnError } =
      listenersRef.current;
    if (oldOnCanPlay) audio.removeEventListener('canplaythrough', oldOnCanPlay);
    if (oldOnError) audio.removeEventListener('error', oldOnError);

    // 2. 如果点击的是当前正在播放的音轨，则暂停它
    if (playingPreviewUrl === url) {
      audio.pause();
      setPlayingPreviewUrl(null);
      return;
    }

    // 3. 如果正在播放其他音轨，先暂停它
    audio.pause();
    setPlayingPreviewUrl(null); // 立即更新UI

    // 4. 定义事件处理器
    const onCanPlay = async () => {
      try {
        await audio.play(); // 只有在音频准备好后才播放
        setPlayingPreviewUrl(url); // 播放成功后更新UI状态
      } catch (err) {
        console.error('音频预览播放失败:', err);
        setPlayingPreviewUrl(null);
      }
      cleanup(); // 播放成功或失败后都清理监听器
    };

    const onError = () => {
      console.error('音频预览加载失败。');
      setPlayingPreviewUrl(null);
      cleanup(); // 加载失败后清理监听器
    };

    const cleanup = () => {
      audio.removeEventListener('canplaythrough', onCanPlay);
      audio.removeEventListener('error', onError);
      listenersRef.current = {};
    };

    // 5. 将新的监听器保存到 ref 中，以便下次清理
    listenersRef.current = { onCanPlay, onError };

    // 6. 添加一次性的事件监听器
    audio.addEventListener('canplaythrough', onCanPlay);
    audio.addEventListener('error', onError);

    // 7. 设置新的音源并开始加载
    audio.src = url;
    audio.load();
  };

  // 处理选择预设音乐
  const handleSelectDefault = (track: { name: string; url: string }) => {
    onSelectMusic({ type: 'default', ...track });
  };

  // 处理用户上传自定义文件
  const handleCustomFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelectMusic({ type: 'custom', file });
    }
    // 重置 input 的值，允许用户重复上传同一个文件
    if (e.target) e.target.value = '';
  };

  // 处理关闭弹窗（带动画）
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // 等待动画结束后再调用父组件的onClose
  };

  // --- 渲染 (Render) ---
  return (
    <div
      className={`fixed inset-0 z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/70" />
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md flex flex-col transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-gray-200">选择背景音乐</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full text-gray-400 hover:bg-slate-700 hover:text-white transition-colors"
            aria-label="关闭音乐选择"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-6">
          <div>
            <h3 className="text-md font-medium text-gray-300 mb-3">预设声音</h3>
            <ul className="space-y-2">
              {DEFAULT_MUSIC.map(track => {
                const isSelected =
                  currentMusic?.type === 'default' &&
                  currentMusic.url === track.url;
                const isPreviewing = playingPreviewUrl === track.url;
                return (
                  <li
                    key={track.url}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${isSelected ? 'bg-cyan-600/20' : 'hover:bg-slate-800'}`}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handlePlayPreview(track.url)}
                        className={`p-2 rounded-full transition-colors ${isPreviewing ? 'text-cyan-400 bg-slate-700' : 'text-gray-400 hover:bg-slate-700'}`}
                        aria-label={`预览 ${track.name}`}
                      >
                        {isPreviewing ? (
                          <PauseIcon className="w-5 h-5" />
                        ) : (
                          <PlayIcon className="w-5 h-5" />
                        )}
                      </button>
                      <span
                        className={`font-medium ${isSelected ? 'text-cyan-300' : 'text-gray-300'}`}
                      >
                        {track.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleSelectDefault(track)}
                      className={`px-4 py-1.5 text-sm font-semibold rounded-md transition ${isSelected ? 'bg-cyan-500 text-white cursor-default' : 'bg-slate-600 hover:bg-slate-500 text-white'}`}
                      disabled={isSelected}
                    >
                      {isSelected ? '已选择' : '选择'}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h3 className="text-md font-medium text-gray-300 mb-3">
              自定义音乐
            </h3>
            <div className="flex items-center justify-between gap-2 p-3 bg-gray-900/70 border border-slate-600 rounded-lg">
              <div className="flex items-center gap-3 overflow-hidden">
                {currentMusic?.type === 'custom' && customMusicUrl ? (
                  <button
                    onClick={() => handlePlayPreview(customMusicUrl)}
                    className={`p-2 rounded-full transition-colors flex-shrink-0 ${playingPreviewUrl === customMusicUrl ? 'text-cyan-400 bg-slate-700' : 'text-gray-400 hover:bg-slate-700'}`}
                    aria-label={`预览 ${currentMusic.file.name}`}
                  >
                    {playingPreviewUrl === customMusicUrl ? (
                      <PauseIcon className="w-5 h-5" />
                    ) : (
                      <PlayIcon className="w-5 h-5" />
                    )}
                  </button>
                ) : (
                  <MusicIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
                <span
                  className="text-sm text-gray-300 truncate"
                  title={
                    currentMusic?.type === 'custom'
                      ? currentMusic.file.name
                      : '未选择自定义音乐'
                  }
                >
                  {currentMusic?.type === 'custom'
                    ? currentMusic.file.name
                    : '未选择自定义音乐'}
                </span>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => musicInputRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-sm font-semibold rounded-md transition"
                >
                  上传
                </button>
                <input
                  type="file"
                  accept="audio/*"
                  ref={musicInputRef}
                  onChange={handleCustomFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center gap-4 p-4 border-t border-slate-700">
          <button
            onClick={() => onSelectMusic(null)}
            className="px-5 py-2 bg-red-600/80 hover:bg-red-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
            disabled={!currentMusic}
          >
            清除音乐
          </button>
          <button
            onClick={handleClose}
            className="px-5 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};

// =================================================================
// === 设置侧边抽屉 (Settings Drawer)
// =================================================================

interface PomodoroSettingsDrawerProps {
  currentSettings: PomodoroSettings;
  onSave: (newSettings: PomodoroSettings) => void;
  onClose: () => void;
  currentMusic: MusicSelection | null;
  onMusicSelect: (selection: MusicSelection) => void;
  onMusicClear: () => void;
}

export const PomodoroSettingsDrawer: React.FC<PomodoroSettingsDrawerProps> = ({
  currentSettings,
  onSave,
  onClose,
  currentMusic,
  onMusicSelect,
  onMusicClear,
}) => {
  // --- 状态管理 ---
  const [settings, setSettings] = useState(currentSettings); // 存储临时的设置更改
  const [isVisible, setIsVisible] = useState(false); // 控制抽屉的滑入/滑出动画
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false); // 控制音乐选择弹窗的显示

  // --- 副作用 ---

  // 组件挂载时触发滑入动画
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // --- 事件处理器 ---

  // 处理关闭抽屉（带动画）
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // 等待动画结束后再调用父组件的onClose
  };

  // 处理保存设置
  const handleSave = () => {
    // 简单验证，确保时长大于0
    if (
      settings.pomodoro > 0 &&
      settings.shortBreak > 0 &&
      settings.longBreak > 0
    ) {
      onSave(settings); // 调用父组件的回调函数以更新全局状态
      handleClose();
    } else {
      alert('所有时长都必须大于0。');
    }
  };

  // 处理输入框变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const intValue = Math.max(1, parseInt(value, 10) || 1); // 保证最小值为1
    setSettings(prev => ({ ...prev, [name]: intValue }));
  };

  // --- 辅助函数 ---

  // 获取当前选择的音乐名称用于显示
  const getCurrentMusicName = () => {
    if (!currentMusic) return '未选择音乐';
    return currentMusic.type === 'custom'
      ? currentMusic.file.name
      : currentMusic.name;
  };

  // --- 渲染 ---
  return (
    <>
      {/* 抽屉容器 */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
        aria-modal="true"
        role="dialog"
      >
        {/* 背景遮罩 */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* 抽屉面板 */}
        <div
          className={`fixed top-0 right-0 h-full w-full max-w-sm bg-slate-800 border-l border-slate-600 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={e => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-gray-200">设置</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-full text-gray-400 hover:bg-slate-700 hover:text-white transition-colors"
              aria-label="关闭设置"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>

          {/* 内容区域 */}
          <div className="flex-grow p-4 sm:p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* 时长设置 */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-300">
                  番茄钟时长
                </h3>
                <div>
                  <label
                    htmlFor="pomodoro"
                    className="block text-sm font-medium text-gray-400 mb-2"
                  >
                    工作 (分钟)
                  </label>
                  <input
                    type="number"
                    id="pomodoro"
                    name="pomodoro"
                    value={settings.pomodoro}
                    onChange={handleChange}
                    min="1"
                    className="w-full bg-gray-900/70 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                  />
                </div>
                <div>
                  <label
                    htmlFor="shortBreak"
                    className="block text-sm font-medium text-gray-400 mb-2"
                  >
                    短休息 (分钟)
                  </label>
                  <input
                    type="number"
                    id="shortBreak"
                    name="shortBreak"
                    value={settings.shortBreak}
                    onChange={handleChange}
                    min="1"
                    className="w-full bg-gray-900/70 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                  />
                </div>
                <div>
                  <label
                    htmlFor="longBreak"
                    className="block text-sm font-medium text-gray-400 mb-2"
                  >
                    长休息 (分钟)
                  </label>
                  <input
                    type="number"
                    id="longBreak"
                    name="longBreak"
                    value={settings.longBreak}
                    onChange={handleChange}
                    min="1"
                    className="w-full bg-gray-900/70 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                  />
                </div>
              </div>
              {/* 音乐设置 */}
              <div className="border-t border-slate-700 pt-6 space-y-2">
                <h3 className="text-md font-medium text-gray-300">背景音乐</h3>
                <div className="flex items-center justify-between gap-2 p-3 bg-gray-900/70 border border-slate-600 rounded-lg">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MusicIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span
                      className="text-sm text-gray-300 truncate"
                      title={getCurrentMusicName()}
                    >
                      {getCurrentMusicName()}
                    </span>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => setIsMusicModalOpen(true)}
                      className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-sm font-semibold rounded-md transition"
                    >
                      选择
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="flex justify-end gap-4 p-4 sm:p-6 border-t border-slate-700 bg-slate-800">
            <button
              onClick={handleClose}
              className="px-5 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition"
            >
              保存
            </button>
          </div>
        </div>
      </div>

      {/* 音乐选择弹窗的渲染入口 */}
      <MusicSelectionModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        onSelectMusic={selection => {
          if (selection) {
            onMusicSelect(selection);
          } else {
            onMusicClear();
          }
        }}
        currentMusic={currentMusic}
      />
    </>
  );
};
