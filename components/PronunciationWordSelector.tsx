import React, { useState, useMemo } from 'react';
import { WordItem, WordStatus } from '../types';
import { Button } from './Button';
import { Search, Check, X, Volume2, ArrowLeft, Mic } from 'lucide-react';
import { playTextToSpeech } from '../services/geminiService';

interface PronunciationWordSelectorProps {
  words: WordItem[];
  onStart: (selectedWords: WordItem[]) => void;
  onCancel: () => void;
}

export const PronunciationWordSelector: React.FC<PronunciationWordSelectorProps> = ({
  words,
  onStart,
  onCancel,
}) => {
  const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Filter words based on search
  const filteredWords = useMemo(() => {
    if (!searchQuery.trim()) return words;
    const query = searchQuery.toLowerCase();
    return words.filter(
      w =>
        w.word.toLowerCase().includes(query) ||
        w.meaning?.toLowerCase().includes(query) ||
        w.example?.toLowerCase().includes(query)
    );
  }, [words, searchQuery]);

  // Group words by status
  const wordsByStatus = useMemo(() => {
    const grouped = {
      NEW: filteredWords.filter(w => w.status === WordStatus.NEW),
      LEARNING: filteredWords.filter(w => w.status === WordStatus.LEARNING),
      LEARNED: filteredWords.filter(w => w.status === WordStatus.LEARNED),
      MISTAKE: filteredWords.filter(w => w.status === WordStatus.MISTAKE),
    };
    return grouped;
  }, [filteredWords]);

  const toggleWord = (wordId: string) => {
    setSelectedWordIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(wordId)) {
        newSet.delete(wordId);
      } else {
        newSet.add(wordId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedWordIds(new Set(filteredWords.map(w => w.id)));
  };

  const deselectAll = () => {
    setSelectedWordIds(new Set());
  };

  const handleStart = () => {
    const selectedWords = words.filter(w => selectedWordIds.has(w.id));
    if (selectedWords.length === 0) {
      alert('Please select at least one word to practice!');
      return;
    }
    onStart(selectedWords);
  };

  const playWordAudio = async (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await playTextToSpeech(word);
  };

  const selectedCount = selectedWordIds.size;
  const selectedWords = words.filter(w => selectedWordIds.has(w.id));

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" onClick={onCancel} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Select Words for Pronunciation</h1>
            <p className="text-slate-500 mt-1">
              Choose words you want to practice pronouncing
            </p>
          </div>
        </div>

        {/* Search and Selection Controls */}
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={selectAll} className="text-sm">
              Select All
            </Button>
            <Button variant="outline" onClick={deselectAll} className="text-sm">
              Clear All
            </Button>
          </div>
        </div>
      </div>

      {/* Selected Count Badge */}
      {selectedCount > 0 && (
        <div className="mb-6 bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 rounded-full p-2">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-800">
                {selectedCount} {selectedCount === 1 ? 'word' : 'words'} selected
              </div>
              <div className="text-sm text-slate-600">
                Ready to practice pronunciation
              </div>
            </div>
          </div>
          <Button onClick={handleStart} className="shadow-lg">
            Start Practice ({selectedCount})
          </Button>
        </div>
      )}

      {/* Words List by Status */}
      <div className="space-y-6">
        {/* New Words */}
        {wordsByStatus.NEW.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                NEW
              </span>
              <span className="text-slate-500 text-sm">
                {wordsByStatus.NEW.length} {wordsByStatus.NEW.length === 1 ? 'word' : 'words'}
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {wordsByStatus.NEW.map(word => (
                <WordCard
                  key={word.id}
                  word={word}
                  isSelected={selectedWordIds.has(word.id)}
                  onToggle={toggleWord}
                  onPlayAudio={playWordAudio}
                />
              ))}
            </div>
          </div>
        )}

        {/* Learning Words */}
        {wordsByStatus.LEARNING.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
              <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-xs font-bold">
                LEARNING
              </span>
              <span className="text-slate-500 text-sm">
                {wordsByStatus.LEARNING.length} {wordsByStatus.LEARNING.length === 1 ? 'word' : 'words'}
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {wordsByStatus.LEARNING.map(word => (
                <WordCard
                  key={word.id}
                  word={word}
                  isSelected={selectedWordIds.has(word.id)}
                  onToggle={toggleWord}
                  onPlayAudio={playWordAudio}
                />
              ))}
            </div>
          </div>
        )}

        {/* Learned Words */}
        {wordsByStatus.LEARNED.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
              <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold">
                LEARNED
              </span>
              <span className="text-slate-500 text-sm">
                {wordsByStatus.LEARNED.length} {wordsByStatus.LEARNED.length === 1 ? 'word' : 'words'}
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {wordsByStatus.LEARNED.map(word => (
                <WordCard
                  key={word.id}
                  word={word}
                  isSelected={selectedWordIds.has(word.id)}
                  onToggle={toggleWord}
                  onPlayAudio={playWordAudio}
                />
              ))}
            </div>
          </div>
        )}

        {/* Mistake Words */}
        {wordsByStatus.MISTAKE.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
              <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
                MISTAKES
              </span>
              <span className="text-slate-500 text-sm">
                {wordsByStatus.MISTAKE.length} {wordsByStatus.MISTAKE.length === 1 ? 'word' : 'words'}
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {wordsByStatus.MISTAKE.map(word => (
                <WordCard
                  key={word.id}
                  word={word}
                  isSelected={selectedWordIds.has(word.id)}
                  onToggle={toggleWord}
                  onPlayAudio={playWordAudio}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredWords.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-slate-500 font-medium">
              {searchQuery ? 'No words found matching your search.' : 'No words available.'}
            </p>
          </div>
        )}
      </div>

      {/* Fixed Bottom Bar */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg p-4 z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="font-bold text-slate-800">
              {selectedCount} {selectedCount === 1 ? 'word' : 'words'} selected
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleStart} className="shadow-lg">
                <Mic className="w-5 h-5 mr-2" />
                Start Practice
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Word Card Component
interface WordCardProps {
  word: WordItem;
  isSelected: boolean;
  onToggle: (wordId: string) => void;
  onPlayAudio: (word: string, e: React.MouseEvent) => void;
}

const WordCard: React.FC<WordCardProps> = ({ word, isSelected, onToggle, onPlayAudio }) => {
  return (
    <div
      onClick={() => onToggle(word.id)}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-indigo-500 bg-indigo-50 shadow-md'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-slate-800 text-lg">{word.word}</h3>
            {isSelected && (
              <div className="bg-indigo-500 rounded-full p-1">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <p className="text-sm text-slate-600 mb-2">{word.meaning}</p>
          {word.example && (
            <p className="text-xs text-slate-500 italic line-clamp-2">"{word.example}"</p>
          )}
        </div>
        <button
          onClick={(e) => onPlayAudio(word.word, e)}
          className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
            isSelected
              ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

