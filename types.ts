export type ViewState = 'DASHBOARD' | 'IMPORT' | 'LEARN' | 'QUIZ' | 'REVIEW' | 'PRONUNCIATION' | 'PRONUNCIATION_SELECT' | 'STORY' | 'STORY_IMPORT' | 'STORIES_LIBRARY' | 'WORDS_LIBRARY' | 'PROFILE';

export enum WordStatus {
  NEW = 'NEW',
  LEARNING = 'LEARNING',
  LEARNED = 'LEARNED',
  MISTAKE = 'MISTAKE',
}

export type NewReviewRatio = 'BALANCED' | 'GROWTH' | 'RETENTION';
export type WeakPriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type StoryTargetFrequency = 'OFF' | 'DAILY' | 'WEEKLY_3' | 'WEEKLY_5' | 'WEEKLY_7';

export interface DailySettings {
  dailyTarget: number;
  ratio: NewReviewRatio;
  includeWeakWords: boolean;
  weakPriority: WeakPriorityLevel;
  restDayMode: boolean;
  maxSessionTimeMinutes: number; // 0 for unlimited
  storyTarget: StoryTargetFrequency;
}

export interface WordItem {
  id: string;
  word: string;
  meaning: string;
  example: string;
  language?: string;
  status: WordStatus;
  
  // SRS Fields
  interval: number;       // Current gap in days
  repetition: number;     // Consecutive correct answers
  nextReviewDate: number; // Timestamp (ms) when this word is due
  lastReviewDate?: number; // Timestamp (ms) of last review

  // Fragility / Analytics Fields
  strengthScore: number;    // 0-100 Confidence Score
  mistakeCount: number;     // Total persistent mistakes
  totalAttempts: number;    // Total times quizzed
  avgResponseTime: number;  // Average time to answer in ms
}

export interface UserStats {
  streak: number;
  lastLoginDate: string; // YYYY-MM-DD
  wordsLearnedToday: number;
  mistakesCount: number;
  settings: DailySettings;
  
  // Story Stats
  storiesCompletedThisWeek: number;
  lastStoryDate: string; // YYYY-MM-DD
  completedStoryIds: string[];
  
  // Daily Focus Words
  lastFocusWordsDate?: string; // YYYY-MM-DD
  lastFocusWordsIndex?: number; // Index of last word shown in daily focus
  todayFocusWordIds?: string[]; // Today's focus word IDs
}

export interface ImportPreviewItem {
  word: string;
  meaning: string;
  example: string;
  selected: boolean;
}

// Breakdown for the dashboard
export interface SessionBreakdown {
  total: number;
  newCount: number;
  reviewCount: number;
  weakCount: number;
  estimatedMinutes: number;
  storyAvailable: boolean;
}

// Story Interfaces
export interface StoryQuestion {
  id: string;
  type: 'FILL_BLANK' | 'MATCHING';
  question: string; // The sentence with blank or the word
  correctAnswer: string; // The missing word or the meaning
  options?: string[];
  targetWord: string; // The vocabulary word being tested
}

export interface Story {
  id: string;
  title: string;
  content: string; // Full text
  targetWords: string[]; // List of words (strings) included in this story
  questions: StoryQuestion[];
  isCustom?: boolean;
}