import React, { useState } from 'react';
import { Button } from './Button';
import { Database, Copy, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import { REQUIRED_SQL } from '../services/storageService';

interface DatabaseSetupProps {
    onDismiss: () => void;
}

export const DatabaseSetup: React.FC<DatabaseSetupProps> = ({ onDismiss }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(REQUIRED_SQL);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                
                <div className="bg-indigo-600 p-6 flex items-start gap-4">
                    <div className="bg-white/20 p-3 rounded-xl">
                        <Database className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Database Setup Required</h2>
                        <p className="text-indigo-100 mt-1">
                            Your Supabase project is connected, but the required tables are missing.
                        </p>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-xl border border-amber-100">
                             <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                             <div>
                                 <h3 className="font-bold text-amber-800 text-sm">Action Needed</h3>
                                 <p className="text-amber-700 text-sm mt-1">
                                     You must run the SQL below in your Supabase SQL Editor to create the tables.
                                 </p>
                             </div>
                        </div>

                        <div className="relative">
                            <div className="absolute top-2 right-2">
                                <button 
                                    onClick={handleCopy}
                                    className="flex items-center gap-2 bg-white/90 hover:bg-white text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold border shadow-sm transition-all"
                                >
                                    {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                                    {copied ? 'Copied!' : 'Copy SQL'}
                                </button>
                            </div>
                            <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs overflow-x-auto font-mono leading-relaxed h-64 border-4 border-slate-100">
                                {REQUIRED_SQL}
                            </pre>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-bold text-slate-700">Instructions:</h3>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 ml-2">
                                <li>Copy the SQL code above.</li>
                                <li>Go to your <strong>Supabase Dashboard</strong>.</li>
                                <li>Click on <strong>SQL Editor</strong> in the left sidebar.</li>
                                <li>Paste the code and click <strong>Run</strong>.</li>
                                <li>Come back here and click Retry.</li>
                            </ol>
                        </div>
                    </div>

                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <Button 
                        onClick={() => window.location.reload()} 
                        variant="primary"
                        className="shadow-lg shadow-indigo-200"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        I've Run the SQL, Retry
                    </Button>
                </div>
            </div>
        </div>
    );
};