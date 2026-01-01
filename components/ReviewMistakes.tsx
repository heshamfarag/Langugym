import React, { useState } from 'react';
import { WordItem } from '../types';
import { Button } from './Button';
import { Volume2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { playTextToSpeech } from '../services/geminiService';

interface ReviewMistakesProps {
  mistakes: WordItem[];
  onClose: () => void;
}

export const ReviewMistakes: React.FC<ReviewMistakesProps> = ({ mistakes, onClose }) => {
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  const playAudio = async (text: string) => {
    await playTextToSpeech(text);
  };

  const markReviewed = (id: string) => {
      const newSet = new Set(reviewedIds);
      newSet.add(id);
      setReviewedIds(newSet);
  };

  const allReviewed = mistakes.length > 0 && mistakes.every(m => reviewedIds.has(m.id));

  return (
    <div className="max-w-md mx-auto p-6 pb-24 relative min-h-screen">
      <div className="flex items-center gap-4 mb-8">
         <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft className="text-slate-500" />
         </button>
         <h2 className="text-2xl font-bold text-slate-800">Review Mistakes</h2>
      </div>

      <div className="space-y-4">
        {mistakes.length === 0 ? (
            <div className="text-center py-20">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">No mistakes!</h3>
                <p className="text-slate-500">You're doing perfectly.</p>
            </div>
        ) : (
            mistakes.map(word => {
                const isDone = reviewedIds.has(word.id);
                return (
                    <div 
                        key={word.id} 
                        className={`
                            relative bg-white rounded-2xl p-5 border-2 transition-all duration-300
                            ${isDone ? 'border-slate-100 opacity-60 bg-slate-50' : 'border-red-100 shadow-sm'}
                        `}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className={`text-xl font-bold ${isDone ? 'text-slate-400' : 'text-slate-800'}`}>
                                    {word.word}
                                </h3>
                                <p className="text-slate-500 font-medium text-sm mt-1">{word.meaning}</p>
                            </div>
                            <button 
                                onClick={() => playAudio(word.word)} 
                                className="p-2 text-sky-400 hover:text-sky-600 bg-sky-50 rounded-xl ml-2"
                            >
                                <Volume2 className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                             <p className="text-xs text-slate-400 italic flex-1 pr-2 truncate">"{word.example}"</p>
                             
                             {!isDone && (
                                <button 
                                    onClick={() => markReviewed(word.id)}
                                    className="text-sm font-bold text-green-600 bg-green-50 px-3 py-2 rounded-xl hover:bg-green-100"
                                >
                                    Mark Done
                                </button>
                             )}
                        </div>
                    </div>
                );
            })
        )}
      </div>

      {allReviewed && (
        <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto animate-in slide-in-from-bottom">
           <Button fullWidth onClick={onClose} variant="success" className="h-14 shadow-lg">
                Finish Review
           </Button>
        </div>
      )}
    </div>
  );
};