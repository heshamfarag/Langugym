import React, { useState, useRef, useEffect } from 'react';
import { WordItem } from '../types';
import { Button } from './Button';
import { Check, X, ArrowRight } from 'lucide-react';

interface QuizSessionProps {
  words: WordItem[];
  onComplete: (results: { wordId: string; correct: boolean; responseTime: number }[]) => void;
}

export const QuizSession: React.FC<QuizSessionProps> = ({ words, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  const [results, setResults] = useState<{ wordId: string; correct: boolean; responseTime: number }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Timer Refs
  const startTimeRef = useRef<number>(Date.now());
  const [currentDuration, setCurrentDuration] = useState(0);

  const currentWord = words[currentIndex];
  const progress = (currentIndex / words.length) * 100;

  useEffect(() => {
    if (status === 'IDLE') {
        inputRef.current?.focus();
        startTimeRef.current = Date.now(); // Reset timer when question appears
    }
  }, [currentIndex, status]);

  const getMaskedSentence = (word: WordItem) => {
    // Replace word with underscore blank
    const regex = new RegExp(`\\b${word.word}\\b`, 'gi');
    const parts = word.example.split(regex);
    if (parts.length === 1) return word.example; // Fallback if regex fails strict match
    return (
        <span>
            {parts[0]}
            <span className="inline-block w-32 border-b-4 border-slate-300 mx-1 align-bottom"></span>
            {parts[1]}
        </span>
    );
  };

  const handleSubmit = () => {
    if (!userAnswer.trim()) return;
    
    // Capture duration immediately
    const endTime = Date.now();
    const duration = endTime - startTimeRef.current;
    setCurrentDuration(duration);

    const isCorrect = userAnswer.toLowerCase().trim() === currentWord.word.toLowerCase().trim();
    setStatus(isCorrect ? 'CORRECT' : 'WRONG');
  };

  const handleNext = () => {
    const currentResult = { 
        wordId: currentWord.id, 
        correct: status === 'CORRECT',
        responseTime: currentDuration
    };

    const newResults = [...results, currentResult];
    setResults(newResults);

    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer('');
      setStatus('IDLE');
    } else {
      onComplete(newResults);
    }
  };

  if (!currentWord) return <div>Quiz Complete!</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-2xl mx-auto relative overflow-hidden sm:justify-center sm:h-auto sm:min-h-[600px] sm:py-10">
      
      {/* Progress */}
      <div className="px-6 py-6 w-full max-w-2xl mx-auto">
        <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
            <div 
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
            />
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 px-6 flex flex-col justify-start sm:justify-center pt-4 sm:pt-0 w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-700 mb-8 sm:text-center">Fill in the blank</h2>
        
        <div className="p-8 sm:p-10 bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm mb-8">
            <p className="text-xl sm:text-2xl text-slate-600 font-medium leading-relaxed sm:text-center">
             {getMaskedSentence(currentWord)}
           </p>
           <div className="mt-6 pt-6 border-t border-slate-100 flex items-start gap-3 sm:justify-center">
                <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded">HINT</span>
                <p className="text-base text-slate-500 italic">{currentWord.meaning}</p>
           </div>
        </div>

        <input
            ref={inputRef}
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={status !== 'IDLE'}
            placeholder="Type answer..."
            className={`
                w-full bg-slate-50 border-b-4 border-slate-200 rounded-2xl p-6 text-2xl font-bold text-center text-slate-800 outline-none transition-all
                focus:border-sky-400 focus:bg-white focus:shadow-lg
                ${status === 'CORRECT' ? 'text-green-600 border-green-200 bg-green-50' : ''}
                ${status === 'WRONG' ? 'text-red-500 line-through bg-red-50 border-red-200' : ''}
            `}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    if (status === 'IDLE') handleSubmit();
                    else handleNext();
                }
            }}
        />
      </div>

      {/* Button / Feedback Sheet */}
      <div className="p-6 pb-8 sm:pb-0 w-full">
        {status === 'IDLE' ? (
            <Button 
                fullWidth 
                onClick={handleSubmit} 
                disabled={!userAnswer.trim()}
                className="h-16 text-xl shadow-lg"
            >
                Check Answer
            </Button>
        ) : (
            // Feedback Bottom Sheet (Mobile) / Inline (Desktop)
            <div className={`
                fixed bottom-0 left-0 right-0 p-6 rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 z-50 sm:relative sm:rounded-3xl sm:shadow-none sm:animate-in sm:fade-in sm:mt-4
                ${status === 'CORRECT' ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}
            `}>
                <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-full ${status === 'CORRECT' ? 'bg-green-500' : 'bg-red-500'}`}>
                                {status === 'CORRECT' ? <Check className="text-white w-6 h-6" /> : <X className="text-white w-6 h-6" />}
                            </div>
                            <span className="text-2xl font-bold">
                                {status === 'CORRECT' ? 'Excellent!' : 'Correct solution:'}
                            </span>
                        </div>
                        
                        {status === 'WRONG' && (
                            <p className="text-xl font-bold text-red-700 pl-12">{currentWord.word}</p>
                        )}
                    </div>

                    <Button 
                        variant={status === 'CORRECT' ? 'success' : 'danger'}
                        onClick={handleNext}
                        className={`h-14 sm:w-auto px-8 border-none ${status === 'CORRECT' ? 'bg-green-500 text-white shadow-lg shadow-green-900/10' : 'bg-red-500 text-white shadow-lg shadow-red-900/10'}`}
                    >
                        Continue <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};