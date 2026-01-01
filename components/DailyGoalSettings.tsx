import React, { useState } from 'react';
import { DailySettings, NewReviewRatio, WeakPriorityLevel, StoryTargetFrequency } from '../types';
import { Button } from './Button';
import { X, Sliders, Battery, Calendar, Clock, BarChart3, Save, Check, BookOpen } from 'lucide-react';

interface DailyGoalSettingsProps {
  currentSettings: DailySettings;
  onClose: () => void;
  onApplyToday: (settings: DailySettings) => void;
  onSaveDefault: (settings: DailySettings) => void;
}

export const DailyGoalSettings: React.FC<DailyGoalSettingsProps> = ({
  currentSettings,
  onClose,
  onApplyToday,
  onSaveDefault
}) => {
  const [settings, setSettings] = useState<DailySettings>(currentSettings);

  const handleRatioChange = (ratio: NewReviewRatio) => setSettings({ ...settings, ratio });
  const handleWeakPriorityChange = (level: WeakPriorityLevel) => setSettings({ ...settings, weakPriority: level });
  const handleStoryTargetChange = (freq: StoryTargetFrequency) => setSettings({ ...settings, storyTarget: freq });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2 text-slate-800">
            <Sliders className="w-6 h-6 text-sky-500" />
            <h2 className="text-xl font-bold">Daily Load Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 flex-1">
          
          {/* 1. Daily Target */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
                <label className="font-bold text-slate-700 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-sky-500" /> Daily Target
                </label>
                <span className="text-2xl font-extrabold text-sky-600">{settings.dailyTarget} <span className="text-sm font-medium text-slate-400">words</span></span>
            </div>
            <input 
                type="range" 
                min="5" 
                max="100" 
                step="5"
                value={settings.dailyTarget}
                onChange={(e) => setSettings({...settings, dailyTarget: parseInt(e.target.value)})}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <p className="text-xs text-slate-400 text-right">~{Math.ceil(settings.dailyTarget * 0.5)} min session</p>
          </div>

          {/* 2. Ratio */}
          <div className="space-y-3">
             <label className="font-bold text-slate-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-500" /> New vs Review
             </label>
             <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-xl">
                {(['RETENTION', 'BALANCED', 'GROWTH'] as NewReviewRatio[]).map((r) => (
                    <button
                        key={r}
                        onClick={() => handleRatioChange(r)}
                        className={`py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                            settings.ratio === r 
                            ? 'bg-white text-sky-600 shadow-sm' 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {r === 'RETENTION' && 'Review Focus'}
                        {r === 'BALANCED' && 'Balanced'}
                        {r === 'GROWTH' && 'New Words'}
                    </button>
                ))}
             </div>
          </div>
          
           {/* 3. Story Frequency */}
           <div className="space-y-3">
             <label className="font-bold text-slate-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" /> Story Target
             </label>
             <div className="grid grid-cols-3 gap-2">
                <button
                    onClick={() => handleStoryTargetChange('OFF')}
                    className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all ${settings.storyTarget === 'OFF' ? 'bg-slate-100 border-slate-300 text-slate-600' : 'border-slate-100 text-slate-400'}`}
                >
                    Off
                </button>
                 <button
                    onClick={() => handleStoryTargetChange('DAILY')}
                    className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all ${settings.storyTarget === 'DAILY' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-slate-100 text-slate-400'}`}
                >
                    Daily
                </button>
                 <button
                    onClick={() => handleStoryTargetChange('WEEKLY_3')}
                    className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all ${settings.storyTarget === 'WEEKLY_3' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-slate-100 text-slate-400'}`}
                >
                    3 / Week
                </button>
             </div>
          </div>

           {/* 4. Weak Words */}
           <div className="space-y-3">
             <div className="flex justify-between items-center">
                <label className="font-bold text-slate-700 flex items-center gap-2">
                    <Battery className="w-4 h-4 text-orange-500" /> Weak Words Priority
                </label>
                <button 
                    onClick={() => setSettings({...settings, includeWeakWords: !settings.includeWeakWords})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.includeWeakWords ? 'bg-orange-500' : 'bg-slate-200'}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.includeWeakWords ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
             </div>
             
             {settings.includeWeakWords && (
                <div className="grid grid-cols-3 gap-2">
                    {(['LOW', 'MEDIUM', 'HIGH'] as WeakPriorityLevel[]).map((l) => (
                        <button
                            key={l}
                            onClick={() => handleWeakPriorityChange(l)}
                            className={`py-2 px-2 border-2 rounded-xl text-xs font-bold transition-all ${
                                settings.weakPriority === l
                                ? 'border-orange-500 bg-orange-50 text-orange-600'
                                : 'border-slate-100 bg-white text-slate-400'
                            }`}
                        >
                            {l} Priority
                        </button>
                    ))}
                </div>
             )}
          </div>

          {/* 5. Rest Day */}
          <div className="bg-slate-50 rounded-2xl p-4 flex justify-between items-center border border-slate-100">
             <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${settings.restDayMode ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-slate-400'}`}>
                    <Calendar className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-700">Rest Day Mode</h3>
                    <p className="text-xs text-slate-500">No new words. Review only.</p>
                </div>
             </div>
             <button 
                onClick={() => setSettings({...settings, restDayMode: !settings.restDayMode})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.restDayMode ? 'bg-indigo-500' : 'bg-slate-200'}`}
             >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.restDayMode ? 'translate-x-6' : 'translate-x-1'}`} />
             </button>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
            <Button variant="outline" fullWidth onClick={() => onApplyToday(settings)}>
                Apply Today Only
            </Button>
            <Button variant="primary" fullWidth onClick={() => onSaveDefault(settings)}>
                <Save className="w-4 h-4 mr-2" />
                Save Default
            </Button>
        </div>

      </div>
    </div>
  );
};