import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="text-center">
      <div className="inline-block bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700 shadow-lg">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-500">
            {title}
          </span>
        </h1>
      </div>
    </header>
  );
};

export default Header;
