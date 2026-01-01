import React, { useState, useEffect } from 'react';
import { WordItem } from '../types';
import { Button } from './Button';
import { Volume2, Mic, ThumbsUp, HelpCircle, ArrowLeft, CheckCircle, AlertTriangle, Lightbulb, BookOpen } from 'lucide-react';
import { playTextToSpeech } from '../services/geminiService';

interface PronunciationSessionProps {
  words: WordItem[];
  onComplete: (results: { wordId: string; success: boolean }[]) => void;
  onExit: () => void;
}

// Helper function to generate pronunciation tips based on word patterns
const getPronunciationTips = (word: string): string[] => {
  const tips: string[] = [];
  const lowerWord = word.toLowerCase();
  
  // Silent letters
  if (lowerWord.includes('gh') && !lowerWord.includes('ghost')) {
    tips.push("The 'gh' is often silent. Focus on the other sounds.");
  }
  if (lowerWord.endsWith('mb') || lowerWord.endsWith('mn')) {
    tips.push("The final 'b' or 'n' is silent. Don't pronounce it.");
  }
  
  // Double consonants
  if (/(.)\1/.test(lowerWord)) {
    tips.push("Double letters usually indicate a short vowel sound before them.");
  }
  
  // Common patterns
  if (lowerWord.includes('tion') || lowerWord.includes('sion')) {
    tips.push("'-tion' and '-sion' are pronounced as 'shun'.");
  }
  if (lowerWord.includes('ough')) {
    tips.push("'-ough' can be tricky. Listen carefully to the audio.");
  }
  if (lowerWord.includes('ph')) {
    tips.push("'ph' is pronounced as 'f'.");
  }
  if (lowerWord.includes('ch') && !lowerWord.includes('sch')) {
    tips.push("'ch' can sound like 'ch' in 'chair' or 'k' in 'character'.");
  }
  
  // Long words
  if (word.length > 8) {
    tips.push("Break long words into syllables. Say each part slowly, then speed up.");
  }
  
  // Vowel combinations
  if (/[aeiou]{2,}/.test(lowerWord)) {
    tips.push("Multiple vowels together often create a single sound. Listen for the diphthong.");
  }
  
  // Default tips if no specific pattern
  if (tips.length === 0) {
    tips.push("Listen carefully and repeat slowly, focusing on each sound.");
    tips.push("Break the word into syllables if it helps.");
    tips.push("Practice saying it multiple times until it feels natural.");
  }
  
  return tips;
};

export const PronunciationSession: React.FC<PronunciationSessionProps> = ({ words, onComplete, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<{ wordId: string; success: boolean }[]>([]);
  const [autoPlayed, setAutoPlayed] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const currentWord = words[currentIndex];
  const progress = (currentIndex / words.length) * 100;

  // Calculate completion stats
  const hardWords = words.filter(w => {
    const result = results.find(r => r.wordId === w.id);
    return result && !result.success;
  });
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;

  const playAudio = async () => {
    await playTextToSpeech(currentWord.word);
  };

  useEffect(() => {
    if (currentWord && !autoPlayed && !isComplete) {
        // Short delay to allow render
        const timer = setTimeout(() => {
            playAudio();
            setAutoPlayed(true);
        }, 500);
        return () => clearTimeout(timer);
    }
  }, [currentIndex, currentWord, isComplete]);

  const handleResponse = (success: boolean) => {
    const newResults = [...results, { wordId: currentWord.id, success }];
    setResults(newResults);

    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setAutoPlayed(false); // Reset for next word
    } else {
      setIsComplete(true);
    }
  };

  const handleFinish = () => {
    onComplete(results);
  };

  // Completion Screen
  if (isComplete) {
    return (
      <div className="max-w-4xl mx-auto p-6 lg:p-12">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white/20 rounded-full p-4">
                <CheckCircle className="w-12 h-12" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-2">Pronunciation Practice Complete!</h2>
            <p className="text-indigo-100">Great job practicing your pronunciation</p>
          </div>

          {/* Stats */}
          <div className="p-8 border-b border-slate-100">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-slate-800 mb-1">{totalCount}</div>
                <div className="text-sm text-slate-500 font-bold uppercase">Words Practiced</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-1">{successCount}</div>
                <div className="text-sm text-slate-500 font-bold uppercase">Sounded Right</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-indigo-600 mb-1">{successRate}%</div>
                <div className="text-sm text-slate-500 font-bold uppercase">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Hard Words Section */}
          {hardWords.length > 0 ? (
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                <h3 className="text-2xl font-bold text-slate-800">
                  Words to Practice More ({hardWords.length})
                </h3>
              </div>

              <div className="space-y-4">
                {hardWords.map((word) => {
                  const tips = getPronunciationTips(word.word);
                  return (
                    <div
                      key={word.id}
                      className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 space-y-4"
                    >
                      {/* Word Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-2xl font-bold text-slate-800">{word.word}</h4>
                            <button
                              onClick={() => playTextToSpeech(word.word)}
                              className="p-2 bg-white rounded-lg hover:bg-orange-100 transition-colors border border-orange-200"
                            >
                              <Volume2 className="w-5 h-5 text-orange-600" />
                            </button>
                          </div>
                          <p className="text-slate-600 font-medium">{word.meaning}</p>
                        </div>
                      </div>

                      {/* Pronunciation Tips */}
                      <div className="bg-white rounded-xl p-4 border border-orange-100">
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="w-5 h-5 text-orange-500" />
                          <h5 className="font-bold text-slate-800">Pronunciation Tips</h5>
                        </div>
                        <ul className="space-y-2">
                          {tips.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                              <span className="text-orange-500 mt-1">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Perfect Pronunciation!</h3>
                <p className="text-slate-600">All words sounded right. Keep up the great work!</p>
              </div>
            </div>
          )}

          {/* General Tips Section */}
          <div className="p-8 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-slate-800">General Pronunciation Tips</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2">🎯 Listen First</h4>
                <p className="text-sm text-slate-600">Always listen to the audio multiple times before attempting to say the word.</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2">🗣️ Break It Down</h4>
                <p className="text-sm text-slate-600">Divide long words into syllables and practice each part separately.</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2">🔄 Repeat Often</h4>
                <p className="text-sm text-slate-600">Repetition is key. Practice difficult words multiple times daily.</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2">👄 Mouth Position</h4>
                <p className="text-sm text-slate-600">Pay attention to how your mouth, tongue, and lips move for different sounds.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-8 border-t border-slate-100 flex gap-4 justify-end">
            <Button variant="outline" onClick={onExit}>
              Back to Dashboard
            </Button>
            <Button onClick={handleFinish} className="shadow-lg">
              Finish Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentWord) return <div>Session Complete</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-2xl mx-auto sm:h-auto sm:min-h-[600px] sm:py-8 sm:justify-center">
      
      {/* Header */}
      <div className="px-6 py-6 flex items-center gap-4 w-full">
        <button onClick={onExit} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
            />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-12">
        
        <div className="space-y-4">
            <h2 className="text-5xl sm:text-7xl font-extrabold text-slate-800 tracking-tight">{currentWord.word}</h2>
            <p className="text-xl text-slate-500 font-medium">{currentWord.meaning}</p>
        </div>

        {/* Big Audio Button */}
        <div className="relative group">
            <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-20 group-hover:opacity-40"></div>
            <button 
                onClick={playAudio}
                className="relative w-40 h-40 bg-indigo-500 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-300 transition-transform active:scale-95 hover:bg-indigo-400 group-hover:scale-105"
            >
                <Volume2 className="w-16 h-16 text-white" />
            </button>
        </div>

        <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold bg-indigo-50 px-6 py-3 rounded-full border border-indigo-100">
                <Mic className="w-5 h-5" />
                <span>Listen & Repeat</span>
            </div>
            <p className="text-sm text-slate-400 font-medium">Say it out loud to yourself</p>
        </div>

      </div>

      {/* Footer Controls */}
      <div className="p-6 pb-8 w-full">
        <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
            <Button 
                variant="secondary" // Reusing secondary style (blue/neutral) or could be custom
                className="h-20 bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-100 shadow-sm"
                onClick={() => handleResponse(false)}
            >
                <div className="flex flex-col items-center">
                    <HelpCircle className="w-6 h-6 mb-1" />
                    <span className="text-xs font-bold uppercase">Need Practice</span>
                </div>
            </Button>

            <Button 
                variant="success"
                className="h-20 shadow-lg shadow-green-500/20"
                onClick={() => handleResponse(true)}
            >
                <div className="flex flex-col items-center">
                    <ThumbsUp className="w-6 h-6 mb-1" />
                    <span className="text-xs font-bold uppercase">Sounded Right</span>
                </div>
            </Button>
        </div>
      </div>
    </div>
  );
};