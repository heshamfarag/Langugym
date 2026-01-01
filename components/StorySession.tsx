import React, { useState, useRef, useEffect } from 'react';
import { Story, WordItem } from '../types';
import { Button } from './Button';
import { Play, Pause, FastForward, Check, X, BookOpen, Headphones, HelpCircle, ArrowRight, Loader2 } from 'lucide-react';
import { findWordInLibrary } from '../services/storyService';
import { playTextToSpeech } from '../services/geminiService';

interface StorySessionProps {
  story: Story;
  allWords: WordItem[];
  onComplete: (quizResults: { wordId: string; correct: boolean }[]) => void;
  onExit: () => void;
}

type Mode = 'READ' | 'LISTEN' | 'QUIZ';

export const StorySession: React.FC<StorySessionProps> = ({ story, allWords, onComplete, onExit }) => {
  const [mode, setMode] = useState<Mode>('READ');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  
  // Quiz State
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizResults, setQuizResults] = useState<{ wordId: string; correct: boolean }[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizStatus, setQuizStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  const [textInput, setTextInput] = useState('');

  // Audio Control Ref
  const stopAudioRef = useRef<(() => void) | null>(null);

  // Stop audio on unmount or mode change
  useEffect(() => {
    return () => {
        if (stopAudioRef.current) stopAudioRef.current();
    };
  }, [mode]);

  const toggleAudio = async () => {
    if (isPlaying) {
        if (stopAudioRef.current) stopAudioRef.current();
        setIsPlaying(false);
        setIsLoadingAudio(false);
    } else {
        setIsLoadingAudio(true);
        // Note: For long stories, Gemini 2.5 TTS might have length limits. 
        // Ideally, we'd chunk this. For MVP, we assume story content is within reasonable limits (~1-2 paragraphs).
        const controller = await playTextToSpeech(story.content, () => {
            setIsPlaying(false);
            stopAudioRef.current = null;
        });
        
        stopAudioRef.current = controller.stop;
        setIsLoadingAudio(false);
        setIsPlaying(true);
    }
  };

  const handleWordClick = async (wordText: string) => {
    const cleanText = wordText.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
    const found = findWordInLibrary(cleanText, allWords);
    if (found) {
        // Use Gemini TTS for the word pronunciation
        await playTextToSpeech(found.word);
        alert(`${found.word}\n\nMeaning: ${found.meaning}`);
    }
  };

  const renderText = () => {
    return story.content.split(' ').map((chunk, i) => {
        const cleanChunk = chunk.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
        const isTarget = story.targetWords.some(t => t.toLowerCase() === cleanChunk.toLowerCase());
        
        if (isTarget) {
            return (
                <span 
                    key={i} 
                    onClick={() => handleWordClick(cleanChunk)}
                    className="text-indigo-600 font-bold cursor-pointer hover:bg-indigo-50 rounded px-0.5 border-b-2 border-indigo-200 transition-colors"
                >
                    {chunk}{' '}
                </span>
            );
        }
        return <span key={i}>{chunk} </span>;
    });
  };

  // --- QUIZ LOGIC ---

  const handleQuizSubmit = () => {
    const q = story.questions[quizIndex];
    let isCorrect = false;

    if (q.type === 'MATCHING') {
        isCorrect = selectedOption === q.correctAnswer;
    } else {
        isCorrect = textInput.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
    }

    setQuizStatus(isCorrect ? 'CORRECT' : 'WRONG');
    
    // Find real word ID if possible to update stats
    const realWord = findWordInLibrary(q.targetWord, allWords);
    if (realWord) {
        setQuizResults(prev => [...prev, { wordId: realWord.id, correct: isCorrect }]);
    }
  };

  const handleNextQuestion = () => {
    if (quizIndex < story.questions.length - 1) {
        setQuizIndex(prev => prev + 1);
        setQuizStatus('IDLE');
        setSelectedOption(null);
        setTextInput('');
    } else {
        onComplete(quizResults);
    }
  };

  // --- RENDER ---

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto bg-white sm:h-auto sm:min-h-[600px] sm:shadow-lg sm:rounded-3xl sm:my-8 sm:border border-slate-100">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        <button 
            onClick={() => setMode('READ')}
            className={`flex-1 py-5 font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors first:rounded-tl-3xl ${mode === 'READ' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-400'}`}
        >
            <BookOpen className="w-5 h-5" /> Read
        </button>
        <button 
            onClick={() => setMode('LISTEN')}
            className={`flex-1 py-5 font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors ${mode === 'LISTEN' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-400'}`}
        >
            <Headphones className="w-5 h-5" /> Listen
        </button>
        <button 
            onClick={() => setMode('QUIZ')}
            className={`flex-1 py-5 font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors last:rounded-tr-3xl ${mode === 'QUIZ' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-400'}`}
        >
            <HelpCircle className="w-5 h-5" /> Quiz
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10">
        
        {/* READ MODE */}
        {mode === 'READ' && (
            <div className="space-y-8 max-w-2xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800">{story.title}</h2>
                <div className="prose prose-lg prose-slate max-w-none">
                    <p className="text-xl leading-loose text-slate-600 font-serif">
                        {renderText()}
                    </p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl text-sm text-indigo-700 font-medium text-center border border-indigo-100 flex items-center justify-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Tap highlighted words to see meanings & hear pronunciation
                </div>
                <Button fullWidth onClick={() => setMode('LISTEN')} className="h-14">
                    Next: Listen <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        )}

        {/* LISTEN MODE */}
        {mode === 'LISTEN' && (
            <div className="flex flex-col items-center justify-center h-full space-y-10 max-w-lg mx-auto py-10">
                 <div className="w-40 h-40 bg-indigo-50 rounded-full flex items-center justify-center shadow-inner">
                    <Headphones className="w-16 h-16 text-indigo-500" />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-800 text-center">{story.title}</h2>
                 
                 <div className="flex items-center gap-8 bg-slate-50 px-8 py-4 rounded-full border border-slate-100">
                    <button 
                        onClick={toggleAudio}
                        className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-80 disabled:scale-100"
                        disabled={isLoadingAudio}
                    >
                        {isLoadingAudio ? (
                            <Loader2 className="w-8 h-8 animate-spin text-white" />
                        ) : isPlaying ? (
                            <Pause className="w-8 h-8 fill-white" />
                        ) : (
                            <Play className="w-8 h-8 fill-white ml-1" />
                        )}
                    </button>
                 </div>
                 
                 <div className="w-full pt-6 space-y-4">
                    <p className="text-center text-sm text-slate-400">Natural voice powered by Gemini</p>
                    <Button fullWidth onClick={() => setMode('QUIZ')} className="h-14">
                        Start Quiz
                    </Button>
                    <Button variant="ghost" fullWidth onClick={() => onComplete([])} className="text-slate-400">
                        Finish (Listen Only)
                    </Button>
                 </div>
            </div>
        )}

        {/* QUIZ MODE */}
        {mode === 'QUIZ' && (
            <div className="h-full flex flex-col max-w-xl mx-auto py-6">
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-8">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-3 py-1 rounded-full border border-slate-100">Question {quizIndex + 1} of {story.questions.length}</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-800 mb-10 leading-relaxed">
                        {story.questions[quizIndex].question}
                    </h3>

                    {story.questions[quizIndex].type === 'MATCHING' && (
                        <div className="space-y-4">
                            {story.questions[quizIndex].options?.map((opt, i) => (
                                <button 
                                    key={i}
                                    disabled={quizStatus !== 'IDLE'}
                                    onClick={() => setSelectedOption(opt)}
                                    className={`w-full p-5 rounded-2xl border-2 text-left font-medium text-lg transition-all ${
                                        selectedOption === opt 
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' 
                                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}

                    {story.questions[quizIndex].type === 'FILL_BLANK' && (
                        <input 
                            type="text"
                            placeholder="Type the missing word..."
                            value={textInput}
                            disabled={quizStatus !== 'IDLE'}
                            onChange={(e) => setTextInput(e.target.value)}
                            className="w-full p-5 text-2xl border-b-4 border-slate-200 focus:border-indigo-500 outline-none bg-slate-50 rounded-t-2xl transition-colors font-bold text-center"
                        />
                    )}

                    {/* Feedback Area */}
                    {quizStatus !== 'IDLE' && (
                        <div className={`mt-8 p-6 rounded-2xl animate-in slide-in-from-bottom duration-300 ${quizStatus === 'CORRECT' ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                            <div className="flex items-center gap-3 font-bold text-lg mb-2">
                                {quizStatus === 'CORRECT' ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                                {quizStatus === 'CORRECT' ? 'Correct!' : 'Not quite.'}
                            </div>
                            {quizStatus === 'WRONG' && (
                                <p className="text-base pl-9">Correct answer: <span className="font-bold">{story.questions[quizIndex].correctAnswer}</span></p>
                            )}
                        </div>
                    )}
                </div>

                <div className="pt-10">
                    {quizStatus === 'IDLE' ? (
                        <Button 
                            fullWidth 
                            onClick={handleQuizSubmit}
                            disabled={story.questions[quizIndex].type === 'MATCHING' ? !selectedOption : !textInput}
                            className="h-14 text-lg shadow-lg"
                        >
                            Check
                        </Button>
                    ) : (
                        <Button fullWidth onClick={handleNextQuestion} variant={quizStatus === 'CORRECT' ? 'success' : 'secondary'} className="h-14 text-lg shadow-lg">
                            {quizIndex < story.questions.length - 1 ? 'Next Question' : 'Finish Story'}
                        </Button>
                    )}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};