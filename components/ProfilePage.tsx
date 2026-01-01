import React from 'react';
import { UserStats, WordItem, WordStatus } from '../types';
import { Button } from './Button';
import { ArrowLeft, Trophy, Star, Book, Flame, Medal, Award, Target, LogOut, Zap } from 'lucide-react';

interface ProfilePageProps {
  stats: UserStats;
  words: WordItem[];
  onBack: () => void;
  onSignOut: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ stats, words, onBack, onSignOut }) => {
  // --- Calculation Logic ---
  
  const learnedWordsCount = words.filter(w => w.status === WordStatus.LEARNED).length;
  const learningWordsCount = words.filter(w => w.status === WordStatus.LEARNING).length;
  const totalStories = stats.completedStoryIds.length;
  
  // XP Calculation
  const currentXP = (learnedWordsCount * 10) + (learningWordsCount * 5) + (totalStories * 50);
  
  const getLevelInfo = (xp: number) => {
    const base = 200;
    const level = Math.floor(xp / base) + 1;
    const nextLevelXP = level * base;
    const prevLevelXP = (level - 1) * base;
    const progress = ((xp - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;
    return { level, progress, nextLevelXP, currentXP: xp };
  };

  const levelInfo = getLevelInfo(currentXP);

  // --- Badges System ---
  const badges = [
    {
        id: 'streak_3',
        name: 'On Fire',
        desc: 'Reach a 3-day streak',
        icon: Flame,
        color: 'text-orange-500',
        bg: 'bg-orange-100',
        unlocked: stats.streak >= 3
    },
    {
        id: 'streak_7',
        name: 'Dedicated',
        desc: 'Reach a 7-day streak',
        icon: Zap,
        color: 'text-yellow-500',
        bg: 'bg-yellow-100',
        unlocked: stats.streak >= 7
    },
    {
        id: 'words_10',
        name: 'First Steps',
        desc: 'Learn 10 words',
        icon: Star,
        color: 'text-blue-500',
        bg: 'bg-blue-100',
        unlocked: learnedWordsCount >= 10
    },
    {
        id: 'words_50',
        name: 'Scholar',
        desc: 'Learn 50 words',
        icon: Award,
        color: 'text-indigo-500',
        bg: 'bg-indigo-100',
        unlocked: learnedWordsCount >= 50
    },
    {
        id: 'stories_1',
        name: 'Reader',
        desc: 'Complete 1 story',
        icon: Book,
        color: 'text-green-500',
        bg: 'bg-green-100',
        unlocked: totalStories >= 1
    },
    {
        id: 'stories_5',
        name: 'Bookworm',
        desc: 'Complete 5 stories',
        icon: Book,
        color: 'text-emerald-600',
        bg: 'bg-emerald-100',
        unlocked: totalStories >= 5
    }
  ];

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="max-w-5xl mx-auto bg-white min-h-screen pb-10">
        {/* Navigation */}
        <div className="px-6 py-6 flex items-center gap-4 border-b border-slate-50 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
            <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
        </div>

        <div className="p-6 lg:p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: User Card & Level */}
            <div className="md:col-span-1 space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-6">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full p-1.5 border-4 border-indigo-100">
                            <img 
                                src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e0e7ff" 
                                alt="Avatar" 
                                className="w-full h-full rounded-full object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-3 bg-indigo-600 text-white text-sm font-bold px-4 py-1.5 rounded-full border-4 border-white shadow-sm">
                            Level {levelInfo.level}
                        </div>
                    </div>
                    
                    <div className="w-full space-y-3 pt-2">
                        <h2 className="text-2xl font-bold text-slate-800">Learner</h2>
                        
                        <div className="space-y-1">
                            {/* Level Progress Bar */}
                            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                                <div 
                                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${levelInfo.progress}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs font-bold text-slate-400">
                                <span>{levelInfo.currentXP} XP</span>
                                <span>{levelInfo.nextLevelXP} XP</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex flex-col gap-3">
                     <Button fullWidth variant="outline" className="h-12 text-sm bg-white hover:bg-slate-50">
                        Share Progress
                    </Button>
                    
                    <Button 
                        fullWidth 
                        variant="ghost" 
                        onClick={onSignOut} 
                        className="h-12 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </div>

            {/* RIGHT COLUMN: Stats & Badges */}
            <div className="md:col-span-2 space-y-8">
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center py-6">
                        <div className="bg-white p-3 rounded-full mb-2 shadow-sm">
                            <Target className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-2xl font-bold text-slate-800">{learnedWordsCount}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Learned</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center py-6">
                        <div className="bg-white p-3 rounded-full mb-2 shadow-sm">
                            <Flame className="w-5 h-5 text-orange-500" />
                        </div>
                        <span className="text-2xl font-bold text-slate-800">{stats.streak}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Day Streak</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center py-6">
                        <div className="bg-white p-3 rounded-full mb-2 shadow-sm">
                            <Book className="w-5 h-5 text-green-500" />
                        </div>
                        <span className="text-2xl font-bold text-slate-800">{totalStories}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Stories</span>
                    </div>
                </div>

                {/* Badges Section */}
                <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" /> Achievements
                        </h3>
                        <span className="text-sm font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{unlockedCount} / {badges.length}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {badges.map((badge) => (
                            <div 
                                key={badge.id}
                                className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                                    badge.unlocked 
                                    ? 'bg-white border-slate-100 shadow-sm opacity-100 hover:border-indigo-100' 
                                    : 'bg-slate-50 border-transparent opacity-50 grayscale'
                                }`}
                            >
                                <div className={`p-4 rounded-full shrink-0 ${badge.unlocked ? badge.bg : 'bg-slate-200'}`}>
                                    <badge.icon className={`w-6 h-6 ${badge.unlocked ? badge.color : 'text-slate-400'}`} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-base text-slate-700">{badge.name}</h4>
                                    <p className="text-xs font-medium text-slate-400">{badge.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Mobile Actions (Visible only on small screens) */}
                <div className="md:hidden flex flex-col gap-3 pt-4">
                     <Button fullWidth variant="outline" className="h-12 text-sm">
                        Share Progress
                    </Button>
                    <Button 
                        fullWidth 
                        variant="ghost" 
                        onClick={onSignOut} 
                        className="h-12 text-sm text-red-500 hover:bg-red-50"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
};