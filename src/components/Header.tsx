import React from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface HeaderProps {
  title: string;
  user?: User;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, user, onLogout }) => {
  return (
    <header className="flex items-center justify-between bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-700 shadow-lg">
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-500">
          {title}
        </span>
      </h1>
      {user && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-300">
            {user.name || user.email}
          </span>
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded transition"
            >
              登出
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
