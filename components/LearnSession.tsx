import React, { useState } from 'react';
import { WordItem } from '../types';
import { Button } from './Button';
import { Volume2, RotateCw } from 'lucide-react';
import { playTextToSpeech } from '../services/geminiService';

interface LearnSessionProps {
  words: WordItem[];
  onComplete: (learnedWords: WordItem[]) => void;
}

export const LearnSession: React.FC<LearnSessionProps> = ({ words, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const currentWord = words[currentIndex];
  const progress = ((currentIndex) / words.length) * 100;

  const playAudio = async (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    await playTextToSpeech(text);
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete(words);
    }
  };

  if (!currentWord) return <div>No words to learn.</div>;

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-80px)] sm:h-auto sm:min-h-[600px] sm:py-8">
      
      {/* Top Bar */}
      <div className="px-6 py-4 flex items-center gap-4">
        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
                className="h-full bg-green-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
        <span className="text-sm font-bold text-slate-400 whitespace-nowrap">
            {currentIndex + 1} / {words.length}
        </span>
      </div>

      {/* Main Flashcard Area */}
      <div className="flex-1 px-4 py-2 perspective-1000 flex flex-col justify-center">
        <div 
            className="w-full aspect-[4/5] sm:aspect-[4/3] md:aspect-video relative cursor-pointer group mx-auto max-h-[60vh] sm:max-h-none"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            {/* Card Content */}
            <div className={`
                w-full h-full bg-white rounded-3xl border-b-8 border-r-2 border-l-2 border-t-2 border-slate-200 
                flex flex-col items-center justify-center p-8 text-center transition-all duration-300
                shadow-sm group-hover:border-slate-300 group-active:border-b-4 group-active:translate-y-1 relative overflow-hidden
            `}>
                
                {/* Front of Card (Word) */}
                {!isFlipped ? (
                    <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center justify-center h-full">
                         <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 sm:mb-12">Tap to reveal</span>
                        <h2 className="text-4xl sm:text-6xl font-extrabold text-slate-800 mb-8 sm:mb-12 break-words max-w-full px-4">{currentWord.word}</h2>
                        <button 
                            onClick={(e) => playAudio(e, currentWord.word)}
                            className="p-4 bg-sky-50 rounded-2xl text-sky-500 hover:bg-sky-100 transition-colors transform hover:scale-110"
                        >
                            <Volume2 className="w-8 h-8 sm:w-10 sm:h-10" />
                        </button>
                    </div>
                ) : (
                    /* Back of Card (Meaning) */
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 w-full max-w-lg mx-auto flex flex-col h-full justify-center">
                        <div className="text-left mb-6 sm:mb-8">
                            <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">{currentWord.meaning}</h3>
                            <div className="h-1.5 w-16 bg-green-500 rounded-full"></div>
                        </div>
                        
                        <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl text-left border border-slate-100 mb-6">
                             <p className="text-slate-600 font-medium text-lg leading-relaxed italic">"{currentWord.example}"</p>
                        </div>
                        
                        <div className="flex justify-center pt-2">
                             <button 
                                onClick={(e) => playAudio(e, currentWord.word)}
                                className="flex items-center text-sm font-bold text-sky-500 hover:text-sky-600 px-5 py-3 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors"
                            >
                                <Volume2 className="w-5 h-5 mr-2" />
                                Listen Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 pb-8 bg-white/50 backdrop-blur-sm sm:bg-transparent">
        <div className="max-w-xl mx-auto">
            {!isFlipped ? (
                <Button 
                    fullWidth 
                    onClick={() => setIsFlipped(true)}
                    className="h-14 sm:h-16 text-lg shadow-lg"
                    variant="primary"
                >
                    Reveal Answer
                </Button>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                     <Button 
                        variant="danger"
                        className="h-14 sm:h-16 text-lg shadow-lg"
                        onClick={handleNext}
                    >
                        <RotateCw className="w-5 h-5 mr-2" />
                        Still Learning
                    </Button>
                    <Button 
                        variant="success"
                        className="h-14 sm:h-16 text-lg shadow-lg"
                        onClick={handleNext}
                    >
                        I Know This
                    </Button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};