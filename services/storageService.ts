import { supabase, isSupabaseConfigured } from './supabaseClient';
import { WordItem, UserStats, WordStatus, DailySettings, SessionBreakdown, Story } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

const getTodayDateString = () => new Date().toISOString().split('T')[0];
const LOCAL_WORDS_KEY = 'vocabflow_local_words';
const LOCAL_STATS_KEY = 'vocabflow_local_stats';
const LOCAL_STORIES_KEY = 'vocabflow_local_stories';

// Helper to format errors readably
const formatError = (error: any) => {
    try {
        if (error instanceof Error) return error.message;
        if (typeof error === 'object' && error !== null) {
            return JSON.stringify(error, null, 2);
        }
        return String(error);
    } catch (e) {
        return "Unknown error (failed to format)";
    }
};

// Event emitter for missing tables
type MissingTableCallback = () => void;
let missingTableListeners: MissingTableCallback[] = [];

export const onMissingTables = (callback: MissingTableCallback) => {
    missingTableListeners.push(callback);
};

const notifyMissingTables = () => {
    missingTableListeners.forEach(cb => cb());
};

export const REQUIRED_SQL = `
-- 1. Create Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  streak int default 0,
  last_login_date text,
  words_learned_today int default 0,
  mistakes_count int default 0,
  settings jsonb,
  stories_completed_this_week int default 0,
  last_story_date text,
  completed_story_ids jsonb,
  last_focus_words_date text,
  last_focus_words_index int default 0,
  today_focus_word_ids jsonb
);

-- 2. Create User Words Table
create table if not exists public.user_words (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  word text not null,
  meaning text,
  example text,
  language text,
  status text,
  interval int default 0,
  repetition int default 0,
  next_review_date bigint default 0,
  last_review_date bigint,
  strength_score int default 0,
  mistake_count int default 0,
  total_attempts int default 0,
  avg_response_time float default 0
);

-- 3. Create Stories Table (User Imported/Generated)
create table if not exists public.stories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  content text not null,
  target_words text[], -- Array of strings
  questions jsonb,     -- Store question objects structure
  created_at timestamptz default now()
);

-- 4. Create Orders Table
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  status text default 'pending', 
  amount_total integer not null, 
  currency text default 'USD',
  items jsonb, 
  transaction_id text,
  created_at timestamptz default now()
);

-- 5. Enable RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.user_words enable row level security;
alter table public.stories enable row level security;
alter table public.orders enable row level security;

-- 6. Create Policies (Safe to run multiple times)
do $$ begin
  -- Profile Policies
  if not exists (select 1 from pg_policies where policyname = 'Users can select their own profile') then
    create policy "Users can select their own profile" on public.profiles for select using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can update their own profile') then
    create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can insert their own profile') then
    create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
  end if;
  
  -- Word Policies
  if not exists (select 1 from pg_policies where policyname = 'Users can select their own words') then
    create policy "Users can select their own words" on public.user_words for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can insert their own words') then
    create policy "Users can insert their own words" on public.user_words for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can update their own words') then
    create policy "Users can update their own words" on public.user_words for update using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can delete their own words') then
    create policy "Users can delete their own words" on public.user_words for delete using (auth.uid() = user_id);
  end if;

  -- Story Policies
  if not exists (select 1 from pg_policies where policyname = 'Users can select their own stories') then
    create policy "Users can select their own stories" on public.stories for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can insert their own stories') then
    create policy "Users can insert their own stories" on public.stories for insert with check (auth.uid() = user_id);
  end if;
  
   -- Order Policies
  if not exists (select 1 from pg_policies where policyname = 'Users can view their own orders') then
    create policy "Users can view their own orders" on public.orders for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can create their own orders') then
    create policy "Users can create their own orders" on public.orders for insert with check (auth.uid() = user_id);
  end if;
end $$;

-- 7. Fix for PGRST205 (Reload Schema Cache)
NOTIFY pgrst, 'reload config';
`;

let hasAlertedMissingTables = false;

// SQL SETUP INSTRUCTIONS FOR USER
const LOG_SQL_SETUP = () => {
    console.warn(`[MISSING TABLES DETECTED]\nRun this SQL in Supabase SQL Editor:\n${REQUIRED_SQL}`);
    
    if (!hasAlertedMissingTables) {
        hasAlertedMissingTables = true;
        notifyMissingTables();
    }
};

// --- DATA FETCHING ---

export const fetchAllWords = async (): Promise<WordItem[]> => {
    if (!isSupabaseConfigured) {
        const local = localStorage.getItem(LOCAL_WORDS_KEY);
        return local ? JSON.parse(local) : [];
    }

    const { data, error } = await supabase.from('user_words').select('*');
    if (error) {
        console.error('Error fetching words:', formatError(error));
        if (error.code === '42P01' || error.code === 'PGRST205') LOG_SQL_SETUP(); 
        return [];
    }
    
    return data.map((w: any) => ({
        id: w.id,
        word: w.word,
        meaning: w.meaning,
        example: w.example,
        language: w.language,
        status: w.status as WordStatus,
        interval: w.interval,
        repetition: w.repetition,
        nextReviewDate: w.next_review_date,
        lastReviewDate: w.last_review_date,
        strengthScore: w.strength_score,
        mistakeCount: w.mistake_count,
        totalAttempts: w.total_attempts,
        avgResponseTime: w.avg_response_time
    }));
};

export const fetchUserStories = async (): Promise<Story[]> => {
    if (!isSupabaseConfigured) {
        const local = localStorage.getItem(LOCAL_STORIES_KEY);
        return local ? JSON.parse(local) : [];
    }

    const { data, error } = await supabase.from('stories').select('*');
    if (error) {
        console.error('Error fetching stories:', formatError(error));
        // Trigger SQL setup if table is missing
        if (error.code === '42P01' || error.code === 'PGRST205') LOG_SQL_SETUP();
        return [];
    }

    return data.map((s: any) => ({
        id: s.id,
        title: s.title,
        content: s.content,
        targetWords: s.target_words,
        questions: s.questions,
        isCustom: true
    }));
};

export const fetchUserStats = async (): Promise<UserStats> => {
    // FALLBACK / DEMO MODE
    if (!isSupabaseConfigured) {
        const local = localStorage.getItem(LOCAL_STATS_KEY);
        if (local) {
            const parsed = JSON.parse(local);
             // Daily Reset Logic for Local Mode
            const today = getTodayDateString();
            if (parsed.lastLoginDate !== today) {
                parsed.lastLoginDate = today;
                parsed.wordsLearnedToday = 0;
                localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(parsed));
            }
            return parsed;
        }
        
        // Initial Local Stats
        const initial = {
            streak: 0,
            lastLoginDate: getTodayDateString(),
            wordsLearnedToday: 0,
            mistakesCount: 0,
            settings: DEFAULT_SETTINGS,
            storiesCompletedThisWeek: 0,
            lastStoryDate: '',
            completedStoryIds: [],
            lastFocusWordsDate: '',
            lastFocusWordsIndex: 0,
            todayFocusWordIds: []
        };
        localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(initial));
        return initial;
    }

    // SUPABASE MODE
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user");

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error || !data) {
        if (error && error.code !== 'PGRST116') { // PGRST116 is "Results contain 0 rows"
             console.log("Error fetching profile (might not exist yet):", formatError(error));
             if (error.code === '42P01' || error.code === 'PGRST205') LOG_SQL_SETUP();
        }

        console.log("Creating default profile for new user.");
        const initialStats = {
             streak: 0,
             last_login_date: getTodayDateString(),
             words_learned_today: 0,
             mistakes_count: 0,
             settings: DEFAULT_SETTINGS,
             stories_completed_this_week: 0,
             last_story_date: '',
             completed_story_ids: [],
             last_focus_words_date: '',
             last_focus_words_index: 0,
             today_focus_word_ids: []
        };
        
        const { error: insertError } = await supabase.from('profiles').insert({
             id: user.id,
             ...initialStats
        });

        if (insertError) {
             console.error('Error creating profile row:', formatError(insertError));
             if (insertError.code === '42P01' || insertError.code === 'PGRST205') LOG_SQL_SETUP();
             
             // Fallback to in-memory stats if DB fails
             return {
                streak: 0,
                lastLoginDate: getTodayDateString(),
                wordsLearnedToday: 0,
                mistakesCount: 0,
                settings: DEFAULT_SETTINGS,
                storiesCompletedThisWeek: 0,
                lastStoryDate: '',
                completedStoryIds: [],
                lastFocusWordsDate: '',
                lastFocusWordsIndex: 0,
                todayFocusWordIds: []
             };
        }
        
        // Convert DB snake_case to app camelCase
        return {
            streak: initialStats.streak,
            lastLoginDate: initialStats.last_login_date,
            wordsLearnedToday: initialStats.words_learned_today,
            mistakesCount: initialStats.mistakes_count,
            settings: initialStats.settings,
            storiesCompletedThisWeek: initialStats.stories_completed_this_week,
            lastStoryDate: initialStats.last_story_date,
            completedStoryIds: initialStats.completed_story_ids as string[],
            lastFocusWordsDate: initialStats.last_focus_words_date || '',
            lastFocusWordsIndex: initialStats.last_focus_words_index || 0,
            todayFocusWordIds: initialStats.today_focus_word_ids as string[] || []
        };
    }
    
    // Check Daily Reset on fetch
    const today = getTodayDateString();
    if (data.last_login_date !== today) {
        const updated = {
            ...data,
            last_login_date: today,
            words_learned_today: 0,
            // Check streak logic (simple version)
            streak: (new Date(today).getTime() - new Date(data.last_login_date).getTime() < 172800000) ? data.streak + 1 : 1
        };
        // Update DB asynchronously
        supabase.from('profiles').update({
            last_login_date: updated.last_login_date,
            words_learned_today: 0,
            streak: updated.streak
        }).eq('id', user.id).then();
        
        return {
            streak: updated.streak,
            lastLoginDate: updated.last_login_date,
            wordsLearnedToday: 0,
            mistakesCount: data.mistakes_count,
            settings: data.settings || DEFAULT_SETTINGS,
            storiesCompletedThisWeek: data.stories_completed_this_week,
            lastStoryDate: data.last_story_date,
            completedStoryIds: data.completed_story_ids || [],
            lastFocusWordsDate: data.last_focus_words_date || '',
            lastFocusWordsIndex: data.last_focus_words_index || 0,
            todayFocusWordIds: data.today_focus_word_ids as string[] || []
        };
    }

    return {
        streak: data.streak,
        lastLoginDate: data.last_login_date,
        wordsLearnedToday: data.words_learned_today,
        mistakesCount: data.mistakes_count,
        settings: data.settings || DEFAULT_SETTINGS,
        storiesCompletedThisWeek: data.stories_completed_this_week,
        lastStoryDate: data.last_story_date,
        completedStoryIds: data.completed_story_ids || [],
        lastFocusWordsDate: data.last_focus_words_date || '',
        lastFocusWordsIndex: data.last_focus_words_index || 0,
        todayFocusWordIds: data.today_focus_word_ids as string[] || []
    };
};

// --- DATA SAVING ---

export const addWords = async (words: WordItem[]) => {
    if (!isSupabaseConfigured) {
        const current = JSON.parse(localStorage.getItem(LOCAL_WORDS_KEY) || '[]');
        localStorage.setItem(LOCAL_WORDS_KEY, JSON.stringify([...current, ...words]));
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dbWords = words.map(w => ({
        user_id: user.id,
        word: w.word,
        meaning: w.meaning,
        example: w.example,
        language: w.language || 'en',
        status: w.status,
        interval: w.interval,
        repetition: w.repetition,
        next_review_date: w.nextReviewDate,
        last_review_date: w.lastReviewDate,
        strength_score: w.strengthScore,
        mistake_count: w.mistakeCount,
        total_attempts: w.totalAttempts,
        avg_response_time: w.avgResponseTime
    }));

    const { error } = await supabase.from('user_words').insert(dbWords);
    if (error) console.error("Error adding words:", error);
};

export const updateWordInDb = async (word: WordItem) => {
    if (!isSupabaseConfigured) {
        const current: WordItem[] = JSON.parse(localStorage.getItem(LOCAL_WORDS_KEY) || '[]');
        const updated = current.map(w => w.id === word.id ? word : w);
        localStorage.setItem(LOCAL_WORDS_KEY, JSON.stringify(updated));
        return;
    }

    const dbWord = {
        status: word.status,
        interval: word.interval,
        repetition: word.repetition,
        next_review_date: word.nextReviewDate,
        last_review_date: word.lastReviewDate,
        strength_score: word.strengthScore,
        mistake_count: word.mistakeCount,
        total_attempts: word.totalAttempts,
        avg_response_time: word.avgResponseTime
    };

    // Assuming word.id corresponds to the UUID in DB. 
    // If word.id is generated client-side for NEW imports, this might fail if we didn't sync IDs.
    // However, fetchAllWords assigns the DB ID to the object.
    const { error } = await supabase.from('user_words').update(dbWord).eq('id', word.id);
    if (error) console.error("Error updating word:", error);
};

export const addStoryToDb = async (story: Story) => {
    if (!isSupabaseConfigured) {
        const current = JSON.parse(localStorage.getItem(LOCAL_STORIES_KEY) || '[]');
        localStorage.setItem(LOCAL_STORIES_KEY, JSON.stringify([...current, story]));
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dbStory = {
        user_id: user.id,
        title: story.title,
        content: story.content,
        target_words: story.targetWords,
        questions: story.questions
    };

    const { error } = await supabase.from('stories').insert(dbStory);
    if (error) console.error("Error saving story:", error);
};

export const saveStats = async (stats: UserStats) => {
    if (!isSupabaseConfigured) {
        localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(stats));
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dbStats = {
        words_learned_today: stats.wordsLearnedToday,
        mistakes_count: stats.mistakesCount,
        settings: stats.settings,
        stories_completed_this_week: stats.storiesCompletedThisWeek,
        last_story_date: stats.lastStoryDate,
        completed_story_ids: stats.completedStoryIds,
        last_focus_words_date: stats.lastFocusWordsDate || '',
        last_focus_words_index: stats.lastFocusWordsIndex || 0,
        today_focus_word_ids: stats.todayFocusWordIds || []
    };

    const { error } = await supabase.from('profiles').update(dbStats).eq('id', user.id);
    if (error) console.error("Error saving stats:", error);
};


// --- DAILY FOCUS WORDS LOGIC ---

/**
 * Get today's focus words - consecutively selected new words each day
 * Returns the words and updated stats (if stats were updated)
 */
export const getTodayFocusWords = (
    allWords: WordItem[], 
    stats: UserStats,
    onStatsUpdate?: (updatedStats: UserStats) => void
): WordItem[] => {
    const today = getTodayDateString();
    const dailyTarget = stats.settings.dailyTarget;
    
    // Get all new words (not yet practiced), sorted by their order in the array
    // This ensures consecutive selection
    const newWords = allWords.filter(w => w.status === WordStatus.NEW && w.totalAttempts === 0);
    
    // Check if we need to generate new focus words for today
    if (stats.lastFocusWordsDate !== today) {
        // New day - select words consecutively starting from last index
        const startIndex = stats.lastFocusWordsIndex || 0;
        const endIndex = Math.min(startIndex + dailyTarget, newWords.length);
        const selectedWords = newWords.slice(startIndex, endIndex);
        
        // Update stats with today's focus words
        const updatedStats: UserStats = {
            ...stats,
            lastFocusWordsDate: today,
            lastFocusWordsIndex: endIndex,
            todayFocusWordIds: selectedWords.map(w => w.id)
        };
        
        // Save updated stats asynchronously
        saveStats(updatedStats).catch(err => console.error("Error saving focus words:", err));
        
        // Notify parent component of stats update
        if (onStatsUpdate) {
            onStatsUpdate(updatedStats);
        }
        
        return selectedWords;
    }
    
    // Same day - return today's focus words if they exist
    if (stats.todayFocusWordIds && stats.todayFocusWordIds.length > 0) {
        const focusWords = allWords.filter(w => stats.todayFocusWordIds!.includes(w.id));
        // If all focus words still exist, return them
        if (focusWords.length === stats.todayFocusWordIds.length) {
            return focusWords;
        }
    }
    
    // Fallback: if no focus words set for today, generate them
    const startIndex = stats.lastFocusWordsIndex || 0;
    const endIndex = Math.min(startIndex + dailyTarget, newWords.length);
    const selectedWords = newWords.slice(startIndex, endIndex);
    
    // Update stats
    const updatedStats: UserStats = {
        ...stats,
        lastFocusWordsDate: today,
        lastFocusWordsIndex: endIndex,
        todayFocusWordIds: selectedWords.map(w => w.id)
    };
    
    saveStats(updatedStats).catch(err => console.error("Error saving focus words:", err));
    if (onStatsUpdate) {
        onStatsUpdate(updatedStats);
    }
    
    return selectedWords;
};

// --- ALGORITHM LOGIC ---

export const getSessionWords = (allWords: WordItem[], stats: UserStats) => {
    const now = Date.now();
    
    // 1. Weak Words (High Priority)
    const weakWords = allWords.filter(w => w.status === WordStatus.MISTAKE || (w.status === WordStatus.LEARNED && w.strengthScore < 40));
    
    // 2. Due Reviews
    const dueReviews = allWords.filter(w => 
        w.status === WordStatus.LEARNED && 
        w.nextReviewDate <= now &&
        !weakWords.includes(w)
    );

    // 3. New Words
    const newWords = allWords.filter(w => w.status === WordStatus.NEW);

    // Calculate Limits based on settings
    const dailyTarget = stats.settings.dailyTarget; 
    // Simplified Ratio Logic for MVP
    let newLimit = Math.floor(dailyTarget * 0.5);
    if (stats.settings.ratio === 'GROWTH') newLimit = Math.floor(dailyTarget * 0.8);
    if (stats.settings.ratio === 'RETENTION') newLimit = Math.floor(dailyTarget * 0.2);
    
    // Adjust for Rest Day
    if (stats.settings.restDayMode) newLimit = 0;

    // Remaining capacity for reviews
    const reviewLimit = dailyTarget - Math.min(newLimit, newWords.length);

    // Build Session List
    let sessionList: WordItem[] = [];
    
    // A. Add Priority Weak Words
    if (stats.settings.includeWeakWords) {
        sessionList = [...sessionList, ...weakWords.slice(0, 10)];
    }

    // B. Add Due Reviews (up to limit)
    const neededReviews = Math.max(0, reviewLimit - sessionList.length);
    sessionList = [...sessionList, ...dueReviews.slice(0, neededReviews)];

    // C. Add New Words (if space)
    const currentCount = sessionList.length;
    if (currentCount < dailyTarget && !stats.settings.restDayMode) {
        const neededNew = dailyTarget - currentCount;
        sessionList = [...sessionList, ...newWords.slice(0, neededNew)];
    }

    // Breakdown Data
    const breakdown: SessionBreakdown = {
        total: sessionList.length,
        newCount: sessionList.filter(w => w.status === WordStatus.NEW).length,
        reviewCount: sessionList.filter(w => w.status === WordStatus.LEARNED).length,
        weakCount: sessionList.filter(w => w.status === WordStatus.MISTAKE).length,
        estimatedMinutes: Math.ceil(sessionList.length * 0.5),
        storyAvailable: !stats.lastStoryDate || stats.lastStoryDate !== getTodayDateString()
    };

    return { sessionList, breakdown };
};

export const getPracticeWords = (allWords: WordItem[]) => {
    // Return random 10 learned words for pronunciation
    return allWords
        .filter(w => w.status !== WordStatus.NEW)
        .sort(() => 0.5 - Math.random())
        .slice(0, 10);
};

export const calculateWordUpdate = (word: WordItem, correct: boolean, responseTime: number): WordItem => {
    const now = Date.now();
    let newInterval = word.interval;
    let newRepetition = word.repetition;
    let newStatus = word.status;
    let newStrength = word.strengthScore;
    let newMistakeCount = word.mistakeCount;

    if (correct) {
        if (newStatus === WordStatus.NEW) newStatus = WordStatus.LEARNING;
        else if (newStatus === WordStatus.MISTAKE) newStatus = WordStatus.LEARNING;
        else if (newStatus === WordStatus.LEARNING && newRepetition >= 2) newStatus = WordStatus.LEARNED;
        
        // SM-2 Inspired Simple Interval
        if (newRepetition === 0) newInterval = 1;
        else if (newRepetition === 1) newInterval = 3;
        else newInterval = Math.round(newInterval * 2.5);

        newRepetition++;
        newStrength = Math.min(100, newStrength + 10);
    } else {
        newStatus = WordStatus.MISTAKE;
        newInterval = 0; // Reset
        newRepetition = 0;
        newStrength = Math.max(0, newStrength - 20);
        newMistakeCount++;
    }

    // Next review date
    const nextReview = now + (newInterval * 24 * 60 * 60 * 1000);

    return {
        ...word,
        status: newStatus,
        interval: newInterval,
        repetition: newRepetition,
        nextReviewDate: nextReview,
        lastReviewDate: now,
        strengthScore: newStrength,
        mistakeCount: newMistakeCount,
        totalAttempts: word.totalAttempts + 1,
        avgResponseTime: (word.avgResponseTime * word.totalAttempts + responseTime) / (word.totalAttempts + 1)
    };
};