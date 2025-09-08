'use client';
import { useState, useEffect } from 'react';
import { useThemeStore } from '../utils/themestore';
import FormCard from './FormCard';

export default function FeedbackCards({ groupedFeedbacks }) {
  const darkMode = useThemeStore((state) => state.darkMode);
  const [loading, setLoading] = useState(true);

  const totalForms = Object.keys(groupedFeedbacks || {}).length;

  useEffect(() => {
    setLoading(false);
  }, [groupedFeedbacks]);

  if (loading) {
    return <div className="text-center text-gray-600">Loading...</div>;
  }

  if (totalForms === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No feedback submissions yet</p>
        <p className="text-gray-400 mt-2">
          They will appear here once users submit feedback.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12 pt-6 border-t border-gray-300 dark:border-gray-700 max-w-6xl mx-auto p-6 transition-colors">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(groupedFeedbacks).map(([formId, feedbacks]) => {
          const formName = feedbacks[0]?.responses?.formName || 'Untitled Form';
          return (
            <FormCard
              key={formId}
              formId={formId}
              formName={formName}
              feedbacks={feedbacks}
            />
          );
        })}
      </div>
    </div>
  );
}
