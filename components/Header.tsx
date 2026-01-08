
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-zinc-800">
      <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
              <path d="M11.584 2.25a.75.75 0 01.773.052l9.25 6.44a.75.75 0 010 1.232l-9.25 6.44a.75.75 0 01-1.192-.616V3a.75.75 0 01.419-.666zM11.584 15.75a.75.75 0 01.773.052l9.25 6.44a.75.75 0 010 1.232l-9.25 6.44a.75.75 0 01-1.192-.616V16.5a.75.75 0 01.419-.666z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">SonicShift <span className="text-blue-500">AI</span></h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Smart Audio Processor</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">How it works</a>
          <a href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Privacy</a>
          <button className="bg-zinc-800 hover:bg-zinc-700 text-sm px-4 py-2 rounded-lg transition-colors border border-zinc-700">
            Sign In
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
