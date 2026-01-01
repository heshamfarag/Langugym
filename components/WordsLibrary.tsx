import React, { useState, useMemo } from 'react';
import { WordItem, WordStatus } from '../types';
import { Button } from './Button';
import { Search, CheckCircle, XCircle, BookOpen, Volume2, ArrowLeft, Filter } from 'lucide-react';
import { playTextToSpeech } from '../services/geminiService';

interface WordsLibraryProps {
  words: WordItem[];
  onBack: () => void;
}

type FilterType = 'ALL' | 'PRACTICED' | 'NOT_PRACTICED' | 'NEW' | 'LEARNING' | 'LEARNED' | 'MISTAKE';

export const WordsLibrary: React.FC<WordsLibraryProps> = ({ words, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<WordStatus | null>(null);

  // Filter words based on search and filter
  const filteredWords = useMemo(() => {
    let result = words;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        w =>
          w.word.toLowerCase().includes(query) ||
          w.meaning?.toLowerCase().includes(query) ||
          w.example?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (selectedStatus) {
      result = result.filter(w => w.status === selectedStatus);
    }

    // Apply practice filter
    if (filter === 'PRACTICED') {
      result = result.filter(w => w.totalAttempts > 0);
    } else if (filter === 'NOT_PRACTICED') {
      result = result.filter(w => w.totalAttempts === 0);
    }

    return result;
  }, [words, searchQuery, filter, selectedStatus]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = words.length;
    const practiced = words.filter(w => w.totalAttempts > 0).length;
    const notPracticed = words.filter(w => w.totalAttempts === 0).length;
    const byStatus = {
      NEW: words.filter(w => w.status === WordStatus.NEW).length,
      LEARNING: words.filter(w => w.status === WordStatus.LEARNING).length,
      LEARNED: words.filter(w => w.status === WordStatus.LEARNED).length,
      MISTAKE: words.filter(w => w.status === WordStatus.MISTAKE).length,
    };
    return { total, practiced, notPracticed, byStatus };
  }, [words]);

  const playWordAudio = async (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await playTextToSpeech(word);
  };

  const getStatusColor = (status: WordStatus) => {
    switch (status) {
      case WordStatus.NEW:
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case WordStatus.LEARNING:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case WordStatus.LEARNED:
        return 'bg-green-100 text-green-700 border-green-200';
      case WordStatus.MISTAKE:
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: WordStatus) => {
    switch (status) {
      case WordStatus.NEW:
        return 'NEW';
      case WordStatus.LEARNING:
        return 'LEARNING';
      case WordStatus.LEARNED:
        return 'LEARNED';
      case WordStatus.MISTAKE:
        return 'MISTAKE';
      default:
        return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">My Words Library</h1>
            <p className="text-slate-500 mt-1">
              {stats.total} total words • {stats.practiced} practiced • {stats.notPracticed} not practiced
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border-2 border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Total Words</div>
          </div>
          <div className="bg-green-50 rounded-xl border-2 border-green-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{stats.practiced}</div>
            <div className="text-xs font-bold text-green-600 uppercase tracking-wide mt-1">Practiced</div>
          </div>
          <div className="bg-orange-50 rounded-xl border-2 border-orange-200 p-4 text-center">
            <div className="text-2xl font-bold text-orange-700">{stats.notPracticed}</div>
            <div className="text-xs font-bold text-orange-600 uppercase tracking-wide mt-1">Not Practiced</div>
          </div>
          <div className="bg-indigo-50 rounded-xl border-2 border-indigo-200 p-4 text-center">
            <div className="text-2xl font-bold text-indigo-700">
              {stats.practiced > 0 ? Math.round((stats.practiced / stats.total) * 100) : 0}%
            </div>
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide mt-1">Progress</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search words..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => { setFilter('ALL'); setSelectedStatus(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                filter === 'ALL' && !selectedStatus
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => { setFilter('PRACTICED'); setSelectedStatus(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                filter === 'PRACTICED'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Practiced
            </button>
            <button
              onClick={() => { setFilter('NOT_PRACTICED'); setSelectedStatus(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                filter === 'NOT_PRACTICED'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <XCircle className="w-4 h-4 inline mr-1" />
              Not Practiced
            </button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <button
            onClick={() => { setSelectedStatus(null); setFilter('ALL'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              !selectedStatus
                ? 'bg-slate-200 text-slate-700'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Status
          </button>
          <button
            onClick={() => { setSelectedStatus(WordStatus.NEW); setFilter('ALL'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              selectedStatus === WordStatus.NEW
                ? 'bg-blue-200 text-blue-700'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            New ({stats.byStatus.NEW})
          </button>
          <button
            onClick={() => { setSelectedStatus(WordStatus.LEARNING); setFilter('ALL'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              selectedStatus === WordStatus.LEARNING
                ? 'bg-yellow-200 text-yellow-700'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Learning ({stats.byStatus.LEARNING})
          </button>
          <button
            onClick={() => { setSelectedStatus(WordStatus.LEARNED); setFilter('ALL'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              selectedStatus === WordStatus.LEARNED
                ? 'bg-green-200 text-green-700'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Learned ({stats.byStatus.LEARNED})
          </button>
          <button
            onClick={() => { setSelectedStatus(WordStatus.MISTAKE); setFilter('ALL'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              selectedStatus === WordStatus.MISTAKE
                ? 'bg-red-200 text-red-700'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Mistakes ({stats.byStatus.MISTAKE})
          </button>
        </div>
      </div>

      {/* Words List */}
      <div className="space-y-4">
        {filteredWords.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">
              {searchQuery ? 'No words found matching your search.' : 'No words match the selected filter.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWords.map(word => {
              const isPracticed = word.totalAttempts > 0;
              return (
                <div
                  key={word.id}
                  className={`bg-white rounded-xl border-2 p-5 transition-all ${
                    isPracticed
                      ? 'border-green-200 bg-green-50/30'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-slate-800">{word.word}</h3>
                        {isPracticed && (
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        )}
                        {!isPracticed && (
                          <XCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{word.meaning}</p>
                      {word.example && (
                        <p className="text-xs text-slate-500 italic line-clamp-2 mb-3">
                          "{word.example}"
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => playWordAudio(word.word, e)}
                      className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex-shrink-0"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Status and Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${getStatusColor(word.status)}`}>
                      {getStatusLabel(word.status)}
                    </span>
                    <div className="text-xs text-slate-500 space-x-3">
                      {isPracticed ? (
                        <>
                          <span className="font-bold text-green-600">{word.totalAttempts} attempts</span>
                          <span>•</span>
                          <span>Score: {word.strengthScore}</span>
                        </>
                      ) : (
                        <span className="text-orange-600 font-bold">Not practiced</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {filteredWords.length > 0 && (
        <div className="mt-8 bg-slate-50 rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-sm text-slate-600">
            Showing <span className="font-bold text-slate-800">{filteredWords.length}</span> of{' '}
            <span className="font-bold text-slate-800">{stats.total}</span> words
            {filter === 'PRACTICED' && ` • ${stats.practiced} practiced`}
            {filter === 'NOT_PRACTICED' && ` • ${stats.notPracticed} not practiced`}
            {selectedStatus && ` • Status: ${getStatusLabel(selectedStatus)}`}
          </p>
        </div>
      )}
    </div>
  );
};

