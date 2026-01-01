import React from 'react';
import { Story } from '../types';
import { Button } from './Button';
import { BookOpen, Plus, Calendar, CheckCircle, ArrowLeft } from 'lucide-react';

interface StoriesLibraryProps {
  stories: Story[];
  completedStoryIds: string[];
  onSelectStory: (story: Story) => void;
  onAddStory: () => void;
  onBack: () => void;
}

export const StoriesLibrary: React.FC<StoriesLibraryProps> = ({
  stories,
  completedStoryIds,
  onSelectStory,
  onAddStory,
  onBack,
}) => {
  const isCompleted = (storyId: string) => completedStoryIds.includes(storyId);

  if (stories.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 lg:p-12">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-slate-800">My Stories</h1>
        </div>

        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center space-y-6">
          <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-10 h-10 text-indigo-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">No stories yet</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Import your first story to start learning vocabulary through engaging content.
            </p>
          </div>
          <Button onClick={onAddStory} className="mt-6 shadow-lg">
            <Plus className="w-5 h-5 mr-2" />
            Import Your First Story
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">My Stories</h1>
            <p className="text-slate-500 mt-1">{stories.length} {stories.length === 1 ? 'story' : 'stories'} in your library</p>
          </div>
        </div>
        <Button onClick={onAddStory} className="shadow-lg">
          <Plus className="w-5 h-5 mr-2" />
          Add Story
        </Button>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => {
          const completed = isCompleted(story.id);
          const wordCount = story.targetWords.length;
          const questionCount = story.questions.length;
          const preview = story.content.substring(0, 150) + (story.content.length > 150 ? '...' : '');

          return (
            <div
              key={story.id}
              className={`bg-white rounded-2xl border-2 transition-all hover:shadow-xl cursor-pointer group ${
                completed
                  ? 'border-green-200 bg-green-50/50'
                  : 'border-slate-200 hover:border-indigo-300'
              }`}
              onClick={() => onSelectStory(story)}
            >
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-800 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {story.title}
                    </h3>
                  </div>
                  {completed && (
                    <div className="flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-green-500 fill-green-100" />
                    </div>
                  )}
                </div>

                {/* Preview Text */}
                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {preview}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <BookOpen className="w-4 h-4" />
                    <span className="font-bold">{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-bold">{questionCount} {questionCount === 1 ? 'question' : 'questions'}</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  fullWidth
                  variant={completed ? "outline" : "primary"}
                  className={`mt-2 ${completed ? 'border-green-300 text-green-700 hover:bg-green-50' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectStory(story);
                  }}
                >
                  {completed ? 'Review Story' : 'Read Story'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

