import React, { useState } from 'react';
import { processStoryText } from '../services/geminiService';
import { Story } from '../types';
import { Button } from './Button';
import { Upload, Check, Loader2, BookOpen, AlertTriangle } from 'lucide-react';

interface StoryImportViewProps {
  onImportComplete: (story: Story) => void;
  onCancel: () => void;
}

export const StoryImportView: React.FC<StoryImportViewProps> = ({ onImportComplete, onCancel }) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewStory, setPreviewStory] = useState<Story | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const story = await processStoryText(inputText);
      setPreviewStory(story);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred processing the story.');
    } finally {
      setLoading(false);
    }
  };

  if (previewStory) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6 h-[calc(100vh-80px)] flex flex-col">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Story Preview</h2>
            <Button variant="ghost" onClick={() => setPreviewStory(null)}>Edit Text</Button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-6 border rounded-3xl p-6 lg:p-8 bg-slate-50">
            <div className="max-w-3xl mx-auto">
                <h3 className="text-3xl font-bold text-indigo-700 mb-2">{previewStory.title}</h3>
                <p className="text-sm text-slate-500 mb-6 font-bold uppercase tracking-wide">{previewStory.content.length} characters</p>
                <div className="text-slate-700 leading-loose text-lg whitespace-pre-wrap font-serif">
                    {previewStory.content}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-6 border-t border-slate-200">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-500" /> Detected Vocabulary
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {previewStory.targetWords.map((w, i) => (
                            <span key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-bold">
                                {w}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" /> Generated Quiz
                    </h4>
                    <p className="text-slate-500 font-medium">{previewStory.questions.length} questions prepared.</p>
                </div>
            </div>
        </div>

        <div className="flex justify-center pt-4">
             <Button 
                onClick={() => onImportComplete(previewStory)}
                className="shadow-xl px-12 h-14 text-lg"
            >
                Save & Add to Library
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-12 space-y-10">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Import Story</h2>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">Paste a short story or article. We'll generate a quiz and extract keywords.</p>
      </div>

      <div className="space-y-6">
        <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Once upon a time..."
            className="w-full h-80 p-6 border-2 border-gray-200 rounded-3xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 resize-none text-lg transition-all"
        />

        {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm flex items-center gap-2 font-bold">
                <AlertTriangle className="w-5 h-5" />
                {error}
            </div>
        )}

        <div className="flex gap-4 pt-4">
          <Button variant="outline" className="flex-1 h-14 text-lg" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            className="flex-1 h-14 text-lg shadow-xl shadow-indigo-500/20" 
            onClick={handleProcess} 
            disabled={!inputText.trim() || loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Analyzing...
              </>
            ) : (
              <>
                <Check className="-ml-1 mr-3 h-5 w-5" />
                Process
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};