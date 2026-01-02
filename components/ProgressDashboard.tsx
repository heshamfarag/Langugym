import React from 'react';
import { UserStats, SessionBreakdown, WordItem, WordStatus } from '../types';
import { Button } from './Button';
import { Plus, Zap, AlertTriangle, Mic, Sliders, BookOpen, Target, TrendingUp, Play, Flame, Calendar } from 'lucide-react';

interface ProgressDashboardProps {
  stats: UserStats;
  totalWords: number;
  mistakesCount: number;
  storyCount?: number;
  todayFocusWords?: WordItem[];
  allWords?: WordItem[];
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

const LinearProgress = ({ current, max }: { current: number; max: number }) => {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-700">Daily Goal</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-600">{current} / {max}</span>
          <span className="text-sm font-bold text-slate-700">({Math.round(percentage)}%)</span>
        </div>
      </div>
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            percentage >= 100 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
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
  allWords = [],
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
  
  // Calculate tomorrow's focus words preview
  const getTomorrowFocusWords = (): WordItem[] => {
    const newWords = allWords.filter(w => w.status === WordStatus.NEW && w.totalAttempts === 0);
    const startIndex = stats.lastFocusWordsIndex || 0;
    const endIndex = Math.min(startIndex + stats.settings.dailyTarget, newWords.length);
    const tomorrowWords = newWords.slice(startIndex, endIndex);
    return tomorrowWords;
  };
  
  const tomorrowFocusWords = getTomorrowFocusWords();
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowDateString = tomorrowDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Google Material Design Style - Progress Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Progress */}
          <div className="flex-1 w-full lg:w-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                {stats.streak > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg">
                    <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                    <span className="text-sm font-bold text-orange-600">{stats.streak}</span>
                  </div>
                )}
                <h1 className="text-2xl font-bold text-slate-900">Today's Progress</h1>
              </div>
            </div>
            <LinearProgress current={stats.wordsLearnedToday} max={stats.settings.dailyTarget} />
            {isGoalMet && (
              <p className="text-sm text-green-600 font-medium mt-2">🎉 Daily goal achieved!</p>
            )}
          </div>

          {/* Right: Quick Stats - Material Design Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer" onClick={onViewAllWords || onImportClick}>
              <div className="text-3xl font-bold text-slate-900 mb-1">{totalWords}</div>
              <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">Words</div>
            </div>
            <div className={`rounded-xl p-4 text-center border transition-colors cursor-pointer ${
              mistakesCount > 0 
                ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}>
              <div className={`text-3xl font-bold mb-1 ${mistakesCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                {mistakesCount}
              </div>
              <div className={`text-xs font-medium uppercase tracking-wide ${
                mistakesCount > 0 ? 'text-red-600' : 'text-slate-600'
              }`}>
                Mistakes
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer" onClick={onViewAllStories}>
              <div className="text-3xl font-bold text-slate-900 mb-1">{storyCount}</div>
              <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">Stories</div>
            </div>
          </div>
        </div>

        {/* Session Breakdown - Material Design Style */}
        {breakdown.total > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Session Preview</h3>
              <span className="text-xs text-slate-500">~{breakdown.estimatedMinutes} min</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                <div className="text-2xl font-bold text-green-700 mb-1">{breakdown.newCount}</div>
                <div className="text-xs font-medium text-green-600">New Words</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                <div className="text-2xl font-bold text-blue-700 mb-1">{breakdown.reviewCount}</div>
                <div className="text-xs font-medium text-blue-600">To Review</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-200">
                <div className="text-2xl font-bold text-orange-700 mb-1">{breakdown.weakCount}</div>
                <div className="text-xs font-medium text-orange-600">Weak Words</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quizlet-Style Study Mode Cards */}
      {totalWords === 0 && storyCount === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Your library is empty</h2>
            <p className="text-slate-600 mb-6">Get started by importing words or stories</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={onImportClick} variant="secondary" className="min-w-[140px]">
                <Plus className="w-4 h-4 mr-2" />
                Import Words
              </Button>
              <Button onClick={onImportStory} variant="outline" className="min-w-[140px]">
                <BookOpen className="w-4 h-4 mr-2" />
                Import Story
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Main Study Mode Card - Quizlet Style */}
          {breakdown.total > 0 && (
            <button
              onClick={onStartLearning}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-2xl p-8 text-left text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Play className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Start Learning</h2>
                    <p className="text-blue-100">
                      {breakdown.total} words ready • {breakdown.estimatedMinutes} min
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold mb-1">{breakdown.total}</div>
                  <div className="text-sm text-blue-100">words</div>
                </div>
              </div>
            </button>
          )}

          {/* Study Mode Cards Grid - Quizlet Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Pronunciation Card */}
            <button
              onClick={onPracticePronunciation}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-left group"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <Mic className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Pronunciation</h3>
              <p className="text-sm text-slate-600">Practice speaking words</p>
            </button>

            {/* Stories Card */}
            {breakdown.storyAvailable && (
              <button
                onClick={onStartStory}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-left group"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Read Story</h3>
                <p className="text-sm text-slate-600">Interactive story reading</p>
              </button>
            )}

            {/* All Stories Card */}
            {onViewAllStories && (
              <button
                onClick={onViewAllStories}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-left group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">All Stories</h3>
                <p className="text-sm text-slate-600">{storyCount} {storyCount === 1 ? 'story' : 'stories'} available</p>
              </button>
            )}

            {/* All Words Card */}
            {onViewAllWords && (
              <button
                onClick={onViewAllWords}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-left group"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">All Words</h3>
                <p className="text-sm text-slate-600">View your vocabulary</p>
              </button>
            )}

            {/* Settings Card */}
            <button
              onClick={onOpenSettings}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-left group"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-colors">
                <Sliders className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Settings</h3>
              <p className="text-sm text-slate-600">Customize your learning</p>
            </button>
          </div>
        </div>
      )}

      {/* Today's Focus Words - Material Design Card */}
      {todayFocusWords.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Today's Focus Words</h3>
                <p className="text-sm text-slate-600">{todayFocusWords.length} new words to learn</p>
              </div>
            </div>
            <Button onClick={onStartLearning} variant="secondary" className="text-sm">
              <Play className="w-4 h-4 mr-1.5" />
              Start
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {todayFocusWords.slice(0, 8).map((word) => (
              <div
                key={word.id}
                className="bg-slate-50 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-100 transition-colors"
              >
                <div className="font-semibold text-sm text-slate-900 mb-0.5">{word.word}</div>
                <div className="text-xs text-slate-600 line-clamp-1">{word.meaning}</div>
              </div>
            ))}
            {todayFocusWords.length > 8 && (
              <div className="bg-slate-50 rounded-lg border border-slate-200 px-3 py-2 flex items-center">
                <span className="text-sm font-semibold text-slate-600">+{todayFocusWords.length - 8} more</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next Day Goal - Material Design Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Next Day Goal</h3>
              <p className="text-sm text-slate-600">{tomorrowDateString}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{stats.settings.dailyTarget}</div>
            <div className="text-xs font-medium text-slate-500">words target</div>
          </div>
        </div>
        
        {tomorrowFocusWords.length > 0 ? (
          <>
            <div className="mb-3">
              <p className="text-sm text-slate-600 mb-2">
                Preview: {tomorrowFocusWords.length} new words ready for tomorrow
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {tomorrowFocusWords.slice(0, 6).map((word) => (
                <div
                  key={word.id}
                  className="bg-blue-50 rounded-lg border border-blue-200 px-3 py-2"
                >
                  <div className="font-semibold text-sm text-slate-900 mb-0.5">{word.word}</div>
                  <div className="text-xs text-slate-600 line-clamp-1">{word.meaning}</div>
                </div>
              ))}
              {tomorrowFocusWords.length > 6 && (
                <div className="bg-blue-50 rounded-lg border border-blue-200 px-3 py-2 flex items-center">
                  <span className="text-sm font-semibold text-slate-600">+{tomorrowFocusWords.length - 6} more</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 text-center">
            <p className="text-sm text-slate-600">
              {allWords.filter(w => w.status === WordStatus.NEW).length === 0 
                ? "No new words available. Import more words to continue learning!"
                : "Complete today's words to unlock tomorrow's goal"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};