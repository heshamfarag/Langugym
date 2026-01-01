import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { Header } from './components/Header';
import { ProgressDashboard } from './components/ProgressDashboard';
import { ImportView } from './components/ImportView';
import { StoryImportView } from './components/StoryImportView';
import { LearnSession } from './components/LearnSession';
import { QuizSession } from './components/QuizSession';
import { PronunciationSession } from './components/PronunciationSession';
import { StorySession } from './components/StorySession';
import { DailyGoalSettings } from './components/DailyGoalSettings';
import { ProfilePage } from './components/ProfilePage';
import { AuthView } from './components/AuthView';
import { DatabaseSetup } from './components/DatabaseSetup';
import { StoriesLibrary } from './components/StoriesLibrary';
import { PronunciationWordSelector } from './components/PronunciationWordSelector';
import { WordsLibrary } from './components/WordsLibrary';
import { ViewState, WordItem, WordStatus, ImportPreviewItem, DailySettings, SessionBreakdown, Story, UserStats } from './types';
import { 
    fetchAllWords, fetchUserStats, addWords, calculateWordUpdate, updateWordInDb, saveStats,
    getSessionWords, getPracticeWords, onMissingTables, fetchUserStories, addStoryToDb,
    getTodayFocusWords
} from './services/storageService';
import { getRecommendedStory } from './services/storyService';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [showSettings, setShowSettings] = useState(false);
  const [showDbSetup, setShowDbSetup] = useState(false);

  const [allWords, setAllWords] = useState<WordItem[]>([]);
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [sessionWords, setSessionWords] = useState<WordItem[]>([]);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [breakdown, setBreakdown] = useState<SessionBreakdown>({
      total: 0, newCount: 0, reviewCount: 0, weakCount: 0, estimatedMinutes: 0, storyAvailable: false
  });

  // Auth Listener
  useEffect(() => {
    // Listen for DB Errors
    onMissingTables(() => {
        setShowDbSetup(true);
    });

    // If Supabase keys are missing or placeholders, enter Demo Mode automatically.
    if (!isSupabaseConfigured) {
        console.warn("Supabase not configured. Running in Demo Mode with LocalStorage.");
        setSession({ user: { id: 'demo-user', email: 'demo@example.com' } });
        loadUserData();
        return;
    }

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
          loadUserData();
      } else {
          setLoadingData(false);
      }
    });

    // Real-time auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
          // If we just logged in or session refreshed, ensure data is loaded
          // We can check if we already have data to avoid double-loading, but safe to reload
          loadUserData();
      } else {
          // Signed out
          setStats(null);
          setAllWords([]);
          setUserStories([]);
          setLoadingData(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async () => {
      setLoadingData(true);
      try {
        const [words, userStats, stories] = await Promise.all([
            fetchAllWords(),
            fetchUserStats(),
            fetchUserStories()
        ]);
        setAllWords(words);
        setStats(userStats);
        setUserStories(stories);
      } catch (e) {
          console.error("Failed to load data", e);
      } finally {
          setLoadingData(false);
      }
  };

  // Calculate today's focus words and breakdown
  const todayFocusWords = stats && allWords.length > 0 
    ? getTodayFocusWords(allWords, stats, (updatedStats) => {
        // Update stats when focus words are generated
        setStats(updatedStats);
      })
    : [];

  // Recalculate breakdown
  useEffect(() => {
    if (stats && allWords.length >= 0) {
        const sessionData = getSessionWords(allWords, stats);
        setBreakdown(sessionData.breakdown);
    }
  }, [stats, allWords]);

  const handleImportComplete = async (items: ImportPreviewItem[]) => {
    const newWords: WordItem[] = items.map(item => ({
      id: crypto.randomUUID(), // Assuming modern browser or polyfill
      ...item,
      status: WordStatus.NEW,
      interval: 0,
      repetition: 0,
      nextReviewDate: 0,
      mistakeCount: 0,
      totalAttempts: 0,
      avgResponseTime: 0,
      strengthScore: 0,
    }));
    
    // Optimistic Update
    setAllWords(prev => [...prev, ...newWords]);
    setView('DASHBOARD');
    
    // DB Update
    await addWords(newWords);
  };
  
  const handleStoryImportComplete = async (story: Story) => {
      // Optimistic update
      setUserStories(prev => [...prev, story]);
      
      // DB Save
      await addStoryToDb(story);
      
      // Navigate to stories library to see the new story
      setView('STORIES_LIBRARY');
  };

  const startLearning = () => {
    if (!stats) return;
    const { sessionList } = getSessionWords(allWords, stats);
    if (sessionList.length === 0) {
        alert("No words to review or learn right now!");
        return;
    }
    setSessionWords(sessionList);
    setView('LEARN');
  };
  
  const startPronunciation = () => {
    // Navigate to word selector to choose words for pronunciation
    setView('PRONUNCIATION_SELECT');
  };

  const handlePronunciationWordsSelected = (selectedWords: WordItem[]) => {
    setSessionWords(selectedWords);
    setView('PRONUNCIATION');
  };
  
  const startStory = () => {
      if (!stats) return;
      const story = getRecommendedStory(stats.completedStoryIds || [], userStories);
      if (!story) {
          alert("All stories completed!");
          return;
      }
      setCurrentStory(story);
      setView('STORY');
  };

  const handleLearnComplete = (words: WordItem[]) => {
    setView('QUIZ');
  };

  const handleQuizComplete = async (results: { wordId: string; correct: boolean; responseTime: number }[]) => {
    if (!stats) return;

    let learnedCountIncrease = 0;
    let mistakeCountIncrease = 0;

    const updatedAllWords = allWords.map(w => {
        const res = results.find(r => r.wordId === w.id);
        if (res) {
            const wasNew = w.status === WordStatus.NEW;
            const updated = calculateWordUpdate(w, res.correct, res.responseTime);
            
            // Check for stat counters
            if (wasNew && updated.status !== WordStatus.NEW) learnedCountIncrease++;
            if (!res.correct) mistakeCountIncrease++;

            // Fire and forget DB update
            updateWordInDb(updated);
            return updated;
        }
        return w;
    });

    setAllWords(updatedAllWords);

    // Update Stats
    const newStats = { 
        ...stats, 
        wordsLearnedToday: stats.wordsLearnedToday + learnedCountIncrease,
        mistakesCount: stats.mistakesCount + mistakeCountIncrease
    };
    setStats(newStats);
    await saveStats(newStats);

    setView('DASHBOARD');
  };

  const handlePronunciationComplete = (results: { wordId: string; success: boolean }[]) => {
    setView('DASHBOARD');
  };
  
  const handleStoryComplete = async (quizResults: { wordId: string; correct: boolean }[]) => {
      if (currentStory && stats) {
           // 1. Update Story Stats
           const newCompletedIds = new Set(stats.completedStoryIds);
           newCompletedIds.add(currentStory.id);
           
           const updatedStats: UserStats = {
               ...stats,
               lastStoryDate: new Date().toISOString().split('T')[0],
               storiesCompletedThisWeek: stats.storiesCompletedThisWeek + 1,
               completedStoryIds: Array.from(newCompletedIds)
           };
           setStats(updatedStats);
           await saveStats(updatedStats);

           setView('DASHBOARD');
           setCurrentStory(null);
      }
  };

  const handleApplyToday = (newSettings: DailySettings) => {
     if(stats) setStats({...stats, settings: newSettings});
     setShowSettings(false);
  };

  const handleSaveDefault = async (newSettings: DailySettings) => {
    if (stats) {
        const newStats = { ...stats, settings: newSettings };
        setStats(newStats);
        await saveStats(newStats);
    }
    setShowSettings(false);
  };

  const handleSignOut = async () => {
    if (isSupabaseConfigured) {
        setLoadingData(true);
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            // Explicitly clear all state to ensure UI updates
            setSession(null);
            setStats(null);
            setAllWords([]);
            setUserStories([]);
            setView('DASHBOARD');
            setLoadingData(false);
        }
    } else {
        // In Demo mode, effectively just reload to reset
        window.location.reload();
    }
  };

  // Immediate Check for Setup
  if (showDbSetup) {
      return <DatabaseSetup onDismiss={() => setShowDbSetup(false)} />;
  }

  if (loadingData) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-white">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="ml-2 font-bold text-slate-600">Loading...</span>
          </div>
      );
  }

  // 1. Check for Session. If no session AND configured -> Auth View
  if (!session && isSupabaseConfigured) {
      return <AuthView />;
  }

  // 2. If we have a session (or demo mode), but no stats yet -> Loading/Preparing
  if (!stats) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-white">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="ml-2 font-bold text-slate-600">Preparing dashboard...</span>
          </div>
      );
  }

  const mistakes = allWords.filter(w => w.status === WordStatus.MISTAKE);

  return (
    <div className="min-h-screen bg-white text-slate-800 pb-10">
      {view !== 'PROFILE' && (
        <Header 
            onGoHome={() => setView('DASHBOARD')} 
            onGoProfile={() => setView('PROFILE')}
            streak={stats.streak} 
        />
      )}
      
      {!isSupabaseConfigured && (
        <div className="bg-orange-100 text-orange-800 text-xs font-bold p-2 text-center">
            Demo Mode (LocalStorage)
        </div>
      )}

      <main className={view !== 'PROFILE' ? 'pt-2' : ''}>
        {view === 'DASHBOARD' && (
          <ProgressDashboard 
            stats={stats}
            totalWords={allWords.length}
            mistakesCount={mistakes.length}
            storyCount={userStories.length}
            todayFocusWords={todayFocusWords}
            onImportClick={() => setView('IMPORT')}
            onStartLearning={startLearning}
            onPracticePronunciation={startPronunciation}
            onOpenSettings={() => setShowSettings(true)}
            onStartStory={startStory}
            onImportStory={() => setView('STORY_IMPORT')}
            onViewAllStories={() => setView('STORIES_LIBRARY')}
            onViewAllWords={() => setView('WORDS_LIBRARY')}
            breakdown={breakdown}
          />
        )}
        
        {view === 'PROFILE' && (
            <ProfilePage 
                stats={stats}
                words={allWords}
                onBack={() => setView('DASHBOARD')}
                onSignOut={handleSignOut}
            />
        )}

        {view === 'IMPORT' && (
          <ImportView 
            onImportComplete={handleImportComplete}
            onCancel={() => setView('DASHBOARD')}
          />
        )}
        
        {view === 'STORY_IMPORT' && (
          <StoryImportView 
            onImportComplete={handleStoryImportComplete}
            onCancel={() => setView('STORIES_LIBRARY')}
          />
        )}

        {view === 'STORIES_LIBRARY' && (
          <StoriesLibrary
            stories={userStories}
            completedStoryIds={stats?.completedStoryIds || []}
            onSelectStory={(story) => {
              setCurrentStory(story);
              setView('STORY');
            }}
            onAddStory={() => setView('STORY_IMPORT')}
            onBack={() => setView('DASHBOARD')}
          />
        )}

        {view === 'WORDS_LIBRARY' && (
          <WordsLibrary
            words={allWords}
            onBack={() => setView('DASHBOARD')}
          />
        )}

        {view === 'LEARN' && (
            <LearnSession 
                words={sessionWords}
                onComplete={handleLearnComplete}
            />
        )}

        {view === 'QUIZ' && (
            <QuizSession 
                words={sessionWords}
                onComplete={handleQuizComplete}
            />
        )}
        
        {view === 'PRONUNCIATION_SELECT' && (
            <PronunciationWordSelector
                words={allWords}
                onStart={handlePronunciationWordsSelected}
                onCancel={() => setView('DASHBOARD')}
            />
        )}

        {view === 'PRONUNCIATION' && (
            <PronunciationSession 
                words={sessionWords}
                onComplete={handlePronunciationComplete}
                onExit={() => setView('DASHBOARD')}
            />
        )}
        
        {view === 'STORY' && currentStory && (
            <StorySession 
                story={currentStory}
                allWords={allWords}
                onComplete={handleStoryComplete}
                onExit={() => setView('DASHBOARD')}
            />
        )}
      </main>

      {showSettings && (
        <DailyGoalSettings 
            currentSettings={stats.settings}
            onClose={() => setShowSettings(false)}
            onApplyToday={handleApplyToday}
            onSaveDefault={handleSaveDefault}
        />
      )}
    </div>
  );
};

export default App;