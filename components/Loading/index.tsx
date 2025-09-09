import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      <div className="backdrop-blur-xl rounded-3xl p-8 shadow-2xl border bg-white/80 border-white/40 shadow-gray-200/50 dark:bg-gray-800/80 dark:border-gray-700/40 dark:shadow-black/20">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Loading...</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;
