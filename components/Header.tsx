import React from 'react';
import { BookOpen, Flame } from 'lucide-react';

interface HeaderProps {
    onGoHome: () => void;
    onGoProfile: () => void;
    streak: number;
}

export const Header: React.FC<HeaderProps> = ({ onGoHome, onGoProfile, streak }) => {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        <div className="flex items-center cursor-pointer group" onClick={onGoHome}>
          <div className="bg-green-100 p-2 rounded-xl group-hover:bg-green-200 transition-colors">
            <BookOpen className="h-6 w-6 text-green-600" />
          </div>
          <span className="ml-3 text-lg font-bold text-slate-700 tracking-tight">LanguGym</span>
        </div>
        
        <div className="flex items-center gap-3">
            {streak > 0 && (
            <div className="flex items-center px-3 py-1 bg-orange-50 border border-orange-100 rounded-full">
                <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
                <span className="ml-1.5 text-sm font-bold text-orange-600">{streak}</span>
            </div>
            )}
            
            <button 
                onClick={onGoProfile}
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-200 hover:border-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                {/* Random avatar seed for consistent look */}
                <img 
                    src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e0e7ff" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                />
            </button>
        </div>
      </div>
    </header>
  );
};