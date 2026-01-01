import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Button } from './Button';
import { Loader2, BookOpen, AlertCircle, Info } from 'lucide-react';

export const AuthView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Success! Check your email for the confirmation link to finish signing up.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
    } catch (err: any) {
        console.error("Google Auth Error:", err);
        setError(err.message || "Failed to initiate Google Login");
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-slate-100">
        
        <div className="text-center mb-8">
            <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Welcome to LanguGym</h1>
            <p className="text-slate-500">Your AI-powered language learning platform.</p>
        </div>

        <div className="space-y-4">
            <button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-12 flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors font-bold text-slate-700 active:scale-95 disabled:opacity-50"
            >
                {/* Google Logo SVG */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 4.61c1.61 0 3.09.56 4.23 1.64l3.18-3.18C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
            </button>

            <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase">Or with email</span>
                <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                placeholder="you@example.com"
                />
            </div>
            
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                minLength={6}
                placeholder="••••••••"
                />
            </div>

            {error && (
                <div className="bg-red-50 p-3 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                        <AlertCircle className="w-4 h-4" />
                        Authentication Failed
                    </div>
                    <p className="text-red-600 text-xs">{error}</p>
                    {error.toLowerCase().includes('apikey') || error.toLowerCase().includes('unauthorized') || error.includes('401') ? (
                         <div className="text-xs text-red-800 bg-red-100 p-2 rounded mt-1">
                             <strong>Tip:</strong> The API Key configured might be incorrect. Please verify you are using the 'anon' (public) key from your Supabase Project Settings.
                         </div>
                    ) : null}
                </div>
            )}

            <Button fullWidth type="submit" disabled={loading} className="h-12">
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (isSignUp ? 'Sign Up' : 'Log In')}
            </Button>
            </form>
        </div>

        <div className="mt-6 text-center space-y-2">
            <button 
                onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                }}
                className="text-sm font-bold text-indigo-600 hover:underline"
            >
                {isSignUp ? "Already have an account? Log In" : "Need an account? Sign Up"}
            </button>
            
            <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
               <Info className="w-3 h-3" />
               <span>Credentials are managed by Supabase Auth</span>
            </div>
        </div>
      </div>
    </div>
  );
};