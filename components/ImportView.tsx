import React, { useState } from 'react';
import { extractVocabulary } from '../services/geminiService';
import { ImportPreviewItem } from '../types';
import { Button } from './Button';
import { Upload, FileText, Check, Loader2, Edit2 } from 'lucide-react';

interface ImportViewProps {
  onImportComplete: (items: ImportPreviewItem[]) => void;
  onCancel: () => void;
}

export const ImportView: React.FC<ImportViewProps> = ({ onImportComplete, onCancel }) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewItems, setPreviewItems] = useState<ImportPreviewItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const items = await extractVocabulary(inputText);
      setPreviewItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setInputText(text);
      };
      reader.readAsText(file);
    }
  };

  const toggleSelection = (index: number) => {
    if (!previewItems) return;
    const newItems = [...previewItems];
    newItems[index].selected = !newItems[index].selected;
    setPreviewItems(newItems);
  };

  const updateItem = (index: number, field: keyof ImportPreviewItem, value: string) => {
      if (!previewItems) return;
      const newItems = [...previewItems];
      // @ts-ignore
      newItems[index][field] = value;
      setPreviewItems(newItems);
  }

  if (previewItems) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-900">Review & Import</h2>
            <Button variant="ghost" onClick={() => setPreviewItems(null)}>Back to Edit</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {previewItems.map((item, idx) => (
            <div 
              key={idx} 
              className={`p-5 rounded-2xl border-2 transition-all ${item.selected ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-100 opacity-60 bg-slate-50'}`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={() => toggleSelection(idx)}
                  className="mt-1.5 h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                />
                <div className="flex-1 space-y-2">
                    <input 
                        value={item.word} 
                        onChange={(e) => updateItem(idx, 'word', e.target.value)}
                        className="block w-full text-xl font-bold bg-transparent border-none p-0 focus:ring-0 text-slate-800"
                    />
                    <input 
                        value={item.meaning} 
                        onChange={(e) => updateItem(idx, 'meaning', e.target.value)}
                        className="block w-full text-sm text-slate-600 bg-transparent border-b border-transparent hover:border-indigo-200 focus:border-indigo-500 focus:ring-0 transition-colors pb-1"
                    />
                    <textarea 
                        value={item.example} 
                        onChange={(e) => updateItem(idx, 'example', e.target.value)}
                        className="block w-full text-xs text-slate-500 italic bg-transparent border-none p-0 focus:ring-0 resize-none"
                        rows={2}
                    />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-6 pt-6 flex justify-center">
            <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-100">
                <Button 
                onClick={() => onImportComplete(previewItems.filter(i => i.selected))}
                disabled={previewItems.filter(i => i.selected).length === 0}
                className="px-8 shadow-lg shadow-indigo-500/30"
                >
                Import {previewItems.filter(i => i.selected).length} Words
                </Button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-12 space-y-10">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Import Vocabulary</h2>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">Paste any text, article, or list of words below. Our AI will extract key vocabulary, definitions, and examples for you.</p>
      </div>

      <div className="space-y-6">
        <div className="relative group">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste text here..."
            className="w-full h-80 p-6 border-2 border-gray-200 rounded-3xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 resize-none text-lg transition-all"
          />
          <div className="absolute bottom-6 right-6">
            <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all hover:scale-105 active:scale-95">
              <Upload className="h-4 w-4 mr-2" />
              Upload .txt / .csv
              <input type="file" accept=".txt,.csv" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        </div>

        {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-medium border border-red-100 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
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
                Processing...
              </>
            ) : (
              <>
                <Check className="-ml-1 mr-3 h-5 w-5" />
                Process with AI
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};