import React from 'react';
import { UserStats, SessionBreakdown, WordItem } from '../types';
import { Button } from './Button';
import { Plus, Zap, AlertTriangle, Check, Mic, Sliders, BookOpen, Target, Volume2 } from 'lucide-react';

interface ProgressDashboardProps {
  stats: UserStats;
  totalWords: number;
  mistakesCount: number;
  storyCount?: number;
  todayFocusWords?: WordItem[];
  onImportClick: () => void;
  onStartLearning: () => void;
  onPracticePronunciation: () => void;
  onOpenSettings: () => void;
  onStartStory: () => void;
  onImportStory: () => void;
  onViewAllStories?: () => void;
  onViewAllWords?: () => void;
  breakdown: SessionBreakdown;
}

const CircularProgress = ({ current, max }: { current: number; max: number }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const percentage = max > 0 ? Math.min(current / max, 1) : 1;
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <div className="relative flex items-center justify-center w-48 h-48 mx-auto">
      {/* Background Circle */}
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          className="text-slate-100"
          strokeWidth="12"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="96"
          cy="96"
        />
        {/* Progress Circle */}
        <circle
          className={`${percentage >= 1 ? 'text-yellow-400' : 'text-green-500'} transition-all duration-1000 ease-out`}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="96"
          cy="96"
        />
      </svg>
      {/* Inner Content */}
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-extrabold text-slate-800">
          {current} <span className="text-xl text-slate-400">/ {max}</span>
        </span>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
          Daily Goal
        </span>
      </div>
    </div>
  );
};

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ 
  stats, 
  totalWords,
  mistakesCount,
  storyCount = 0,
  todayFocusWords = [],
  onImportClick, 
  onStartLearning,
  onPracticePronunciation,
  onOpenSettings,
  onStartStory,
  onImportStory,
  onViewAllStories,
  onViewAllWords,
  breakdown
}) => {
  const isGoalMet = stats.wordsLearnedToday >= stats.settings.dailyTarget;
  
  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Progress & Stats */}
        <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center space-y-6">
                <CircularProgress current={stats.wordsLearnedToday} max={stats.settings.dailyTarget} />
                <div className="space-y-2">
                    {isGoalMet && breakdown.newCount === 0 ? (
                        <div className="bg-yellow-50 text-yellow-800 px-4 py-3 rounded-2xl inline-block font-bold border border-yellow-200 shadow-sm animate-in zoom-in">
                            🎉 Daily Target Met!
                        </div>
                    ) : (
                        <p className="text-slate-500 font-medium text-lg">
                            {breakdown.newCount > 0 ? "Let's learn some new words." : "Keep your memory fresh!"}
                        </p>
                    )}
                </div>
            </div>

            {/* Stats Grid - All three cards in a row */}
            <div className="grid grid-cols-3 gap-4">
                <div 
                    className={`p-6 rounded-3xl border-2 flex flex-col items-center justify-center transition-all ${
                        mistakesCount > 0 
                        ? 'border-red-100 bg-red-50 text-red-400' 
                        : 'border-slate-100 bg-white text-slate-300'
                    }`}
                >
                    <AlertTriangle className={`w-8 h-8 mb-2 ${mistakesCount > 0 ? 'fill-red-100' : ''}`} />
                    <span className="font-bold text-2xl text-slate-700">{mistakesCount}</span>
                    <span className="text-xs font-bold uppercase tracking-wide">
                        {mistakesCount > 0 ? "Prioritized" : "Mistakes"}
                    </span>
                </div>

                {onViewAllWords ? (
                    <button 
                        onClick={onViewAllWords}
                        className="p-6 rounded-3xl border-2 border-slate-100 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-200 active:scale-95 transition-all flex flex-col items-center justify-center group"
                    >
                        <BookOpen className="w-8 h-8 mb-2 text-slate-400 group-hover:text-slate-600" />
                        <span className="font-bold text-2xl text-slate-700">{totalWords}</span>
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Total Words</span>
                    </button>
                ) : (
                    <button 
                        onClick={onImportClick}
                        className="p-6 rounded-3xl border-2 border-slate-100 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-200 active:scale-95 transition-all flex flex-col items-center justify-center group"
                    >
                        <Plus className="w-8 h-8 mb-2 text-slate-400 group-hover:text-slate-600" />
                        <span className="font-bold text-2xl text-slate-700">{totalWords}</span>
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Total Words</span>
                    </button>
                )}

                {onViewAllStories ? (
                    <button 
                        onClick={onViewAllStories}
                        className="p-6 rounded-3xl border-2 border-slate-100 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-200 active:scale-95 transition-all flex flex-col items-center justify-center group"
                    >
                        <BookOpen className="w-8 h-8 mb-2 text-slate-400 group-hover:text-slate-600" />
                        <span className="font-bold text-2xl text-slate-700">{storyCount}</span>
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            {storyCount === 1 ? 'Story' : 'Stories'}
                        </span>
                    </button>
                ) : (
                    <div className="p-6 rounded-3xl border-2 border-slate-100 bg-white text-slate-600 flex flex-col items-center justify-center">
                        <BookOpen className="w-8 h-8 mb-2 text-slate-400" />
                        <span className="font-bold text-2xl text-slate-700">{storyCount}</span>
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            {storyCount === 1 ? 'Story' : 'Stories'}
                        </span>
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT COLUMN: Plan & Actions */}
        <div className="lg:col-span-7 space-y-6">
            
            {/* Today's Focus Words */}
            {todayFocusWords.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border-2 border-indigo-100 shadow-sm p-6 lg:p-8 space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-indigo-500 rounded-xl p-2">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Today's Focus Words</h3>
                            <p className="text-sm text-slate-600">
                                {todayFocusWords.length} new {todayFocusWords.length === 1 ? 'word' : 'words'} to learn today
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {todayFocusWords.slice(0, 8).map((word, idx) => (
                            <div 
                                key={word.id}
                                className="bg-white rounded-xl border border-indigo-200 p-3 hover:shadow-md transition-all"
                            >
                                <div className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">
                                    {word.word}
                                </div>
                                <div className="text-xs text-slate-600 line-clamp-2">
                                    {word.meaning}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {todayFocusWords.length > 8 && (
                        <p className="text-xs text-slate-500 text-center pt-2">
                            +{todayFocusWords.length - 8} more words
                        </p>
                    )}
                    
                    <div className="pt-2">
                        <Button 
                            onClick={onStartLearning}
                            className="w-full shadow-lg"
                        >
                            <Zap className="w-4 h-4 mr-2" />
                            Start Learning Today's Words
                        </Button>
                    </div>
                </div>
            )}
            
            {/* Today Plan Preview Card */}
            {(breakdown.total > 0 || breakdown.storyAvailable) && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-slate-700">Today's Plan</h3>
                        <button onClick={onOpenSettings} className="text-xs font-bold text-sky-500 hover:text-sky-600 bg-sky-50 px-3 py-1.5 rounded-lg hover:bg-sky-100 transition-colors">
                            Adjust
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100 flex flex-col justify-center min-h-[100px]">
                            <div className="text-3xl font-extrabold text-green-600 mb-1">{breakdown.newCount}</div>
                            <div className="text-xs font-bold text-green-500 uppercase tracking-wide">New Words</div>
                        </div>
                        <div className="bg-sky-50 rounded-2xl p-4 text-center border border-sky-100 flex flex-col justify-center min-h-[100px]">
                            <div className="text-3xl font-extrabold text-sky-600 mb-1">{breakdown.reviewCount}</div>
                            <div className="text-xs font-bold text-sky-500 uppercase tracking-wide">To Review</div>
                        </div>
                        <div className="bg-orange-50 rounded-2xl p-4 text-center border border-orange-100 flex flex-col justify-center min-h-[100px]">
                            <div className="text-3xl font-extrabold text-orange-600 mb-1">{breakdown.weakCount}</div>
                            <div className="text-xs font-bold text-orange-500 uppercase tracking-wide">Weak Words</div>
                        </div>
                        {breakdown.storyAvailable ? (
                            <button onClick={onStartStory} className="bg-indigo-500 rounded-2xl p-4 text-center border border-indigo-600 shadow-md flex flex-col justify-center items-center active:scale-95 transition-transform hover:bg-indigo-600 min-h-[100px]">
                                <BookOpen className="w-8 h-8 text-white mb-2 opacity-90"/>
                                <div className="text-xs font-bold text-indigo-100 uppercase tracking-wide">Read Story</div>
                            </button>
                        ) : (
                            <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100 flex flex-col justify-center items-center opacity-50 min-h-[100px]">
                                <Check className="w-8 h-8 text-slate-400 mb-2"/>
                                <div className="text-xs font-bold text-slate-300 uppercase tracking-wide">Read Story</div>
                            </div>
                        )}
                    </div>
                    
                    <div className="text-center text-sm text-slate-400 font-medium">
                        {breakdown.total} words • {breakdown.storyAvailable ? '+ 1 Story • ' : ''} ~{breakdown.estimatedMinutes + (breakdown.storyAvailable ? 5 : 0)} mins
                    </div>
                </div>
            )}

            {/* Main Action Area */}
            <div className="space-y-4">
                {totalWords === 0 && storyCount === 0 ? (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center space-y-6">
                        <p className="text-slate-500 font-medium text-lg">Your library is empty.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                            <Button fullWidth onClick={onImportClick} variant="secondary">
                                <Plus className="w-5 h-5 mr-2" />
                                Import Words
                            </Button>
                            <Button fullWidth onClick={onImportStory} variant="outline">
                                <BookOpen className="w-5 h-5 mr-2" />
                                Import Story
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <Button 
                            fullWidth 
                            onClick={onStartLearning}
                            disabled={breakdown.total === 0}
                            className="h-20 text-xl shadow-xl shadow-green-500/20 transform hover:-translate-y-1 transition-all"
                            variant="primary"
                        >
                            <Zap className="w-6 h-6 mr-3 fill-white" />
                            {breakdown.total > 0 ? "Start Session" : "Vocab Complete"}
                        </Button>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Button 
                                fullWidth 
                                onClick={onPracticePronunciation}
                                className="h-16 text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
                                variant="ghost"
                            >
                                <Mic className="w-5 h-5 mr-2" />
                                Pronunciation
                            </Button>
                            {onViewAllStories && (
                                <Button 
                                    fullWidth
                                    onClick={onViewAllStories}
                                    className="h-16 text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100"
                                    variant="ghost"
                                >
                                    <BookOpen className="w-5 h-5 mr-2" />
                                    All Stories
                                </Button>
                            )}
                            <Button 
                                onClick={onOpenSettings}
                                className="h-16 text-slate-600 bg-white border-slate-200 hover:bg-slate-50 shadow-sm"
                                variant="ghost"
                            >
                                <Sliders className="w-5 h-5 mr-2" />
                                Settings
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};