import { DailySettings } from './types';

export const APP_STORAGE_KEY = 'vocabflow_data_v1';
export const STATS_STORAGE_KEY = 'vocabflow_stats_v1';

export const DEFAULT_SETTINGS: DailySettings = {
  dailyTarget: 20,
  ratio: 'BALANCED', // 50/50
  includeWeakWords: true,
  weakPriority: 'MEDIUM',
  restDayMode: false,
  maxSessionTimeMinutes: 0,
  storyTarget: 'DAILY' 
};

// Using a lighter prompt for speed and strict JSON schema
export const VOCAB_EXTRACTION_PROMPT = `
You are a linguistic expert. Extract vocabulary from the provided text.
Identify distinct words or phrases, their meanings, and a short example sentence for each.
If the text is a list of words, generate the meaning and example.
If the text contains sentences, extract key vocabulary.
Detect the language.
Remove duplicates.
Return a valid JSON object with a "words" property containing an array.
`;