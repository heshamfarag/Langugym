import { Story, WordItem } from '../types';

// Hardcoded System Stories
const SYSTEM_STORIES: Story[] = [
  {
    id: 'story_1',
    title: 'The Morning Routine',
    content: `John woke up early to the sound of birds. He brewed a strong coffee and sat by the window. The sun was rising, casting a golden glow over the city. He opened his book and began to read, enjoying the quiet moment before the chaos of the day began.`,
    targetWords: ['coffee', 'window', 'sun', 'book', 'chaos', 'city', 'morning'],
    questions: [
      {
        id: 'q1',
        type: 'FILL_BLANK',
        targetWord: 'coffee',
        question: 'He brewed a strong ___ and sat by the window.',
        correctAnswer: 'coffee'
      },
      {
        id: 'q2',
        type: 'MATCHING',
        targetWord: 'chaos',
        question: 'What does "chaos" mean in this context?',
        correctAnswer: 'Complete disorder and confusion',
        options: ['Complete disorder and confusion', 'A peaceful time', 'A type of breakfast']
      }
    ]
  },
  {
    id: 'story_2',
    title: 'A Walk in the Park',
    content: `Sarah decided to take a break from work. She walked to the nearby park to clear her mind. The trees were green and the air was fresh. She saw a dog chasing a ball and smiled. It was important to appreciate nature.`,
    targetWords: ['park', 'trees', 'air', 'dog', 'nature', 'work', 'break'],
    questions: [
      {
        id: 'q3',
        type: 'FILL_BLANK',
        targetWord: 'nature',
        question: 'It was important to appreciate ___.',
        correctAnswer: 'nature'
      },
      {
        id: 'q4',
        type: 'MATCHING',
        targetWord: 'fresh',
        question: 'The air was ___.',
        correctAnswer: 'fresh',
        options: ['fresh', 'stale', 'dirty']
      }
    ]
  },
  {
    id: 'story_3',
    title: 'The Tech Conference',
    content: `The developers gathered in the main hall. The speaker discussed the future of artificial intelligence. Everyone listened intently, taking notes on their laptops. Innovation was moving fast, and nobody wanted to be left behind.`,
    targetWords: ['developers', 'future', 'intelligence', 'notes', 'innovation', 'laptops'],
    questions: [
      {
        id: 'q5',
        type: 'FILL_BLANK',
        targetWord: 'innovation',
        question: '___ was moving fast.',
        correctAnswer: 'innovation'
      },
      {
         id: 'q6',
         type: 'MATCHING',
         targetWord: 'future',
         question: 'The speaker discussed the ___ of AI.',
         correctAnswer: 'future',
         options: ['future', 'past', 'history']
      }
    ]
  }
];

export const getAllStories = (userStories: Story[] = []): Story[] => {
    return [...SYSTEM_STORIES, ...userStories];
}

export const getRecommendedStory = (completedStoryIds: string[], userStories: Story[]): Story | null => {
  const all = getAllStories(userStories);
  // Find the first story not yet completed
  const available = all.find(s => !completedStoryIds.includes(s.id));
  return available || null;
};

// Helper to find word details from the user's library matching a story word
export const findWordInLibrary = (wordText: string, library: WordItem[]): WordItem | undefined => {
    return library.find(w => w.word.toLowerCase() === wordText.toLowerCase());
};