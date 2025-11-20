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
    <header className="text-center relative">
      <div className="inline-block bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700 shadow-lg">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-500">
            {title}
          </span>
        </h1>
        {user && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="text-sm text-gray-300">
              欢迎, {user.name || user.email}
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded-md transition"
              >
                登出
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
