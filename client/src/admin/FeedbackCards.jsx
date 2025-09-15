'use client';
import { useState, useEffect } from 'react';
import { useThemeStore } from '../utils/themestore';
import FeedbackList from './FeedbackList';
import { FaWpforms } from 'react-icons/fa';

export default function FeedbackCards({ groupedFeedbacks = {} }) {
  const darkMode = useThemeStore((state) => state.darkMode);
  const [loading, setLoading] = useState(true);

  const formEntries = Object.entries(groupedFeedbacks || []);
  const totalForms = formEntries.length;

  const [selectedFormId, setSelectedFormId] = useState(null);

  useEffect(() => {
    if (totalForms > 0) {
      setSelectedFormId((prev) => prev ?? formEntries[0][0]);
    } else {
      setSelectedFormId(null);
    }
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
    <div
      className={`mt-6 max-w-6xl mx-auto p-4 transition-colors ${
        darkMode ? 'text-gray-100' : 'text-gray-900'
      }`}
    >
      {/* Top: beautified card buttons */}
      <div className="mb-8 flex p-4 gap-4 overflow-x-auto pb-2">
        {formEntries.map(([formId, feedbacks]) => {
          const formName =
            feedbacks[0]?.responses?.formName || 'Untitled Form';
          const count = feedbacks.length;
          const selected = selectedFormId === formId;

          return (
            <button
              key={formId}
              onClick={() => setSelectedFormId(formId)}
              className={`flex-shrink-0 w-56 p-4 rounded-2xl shadow-md transform transition 
                ${
                  selected
                    ? 'scale-105 border-2 border-[var(--lightblue)] ring-2 ring-[var(--lightblue)]'
                    : 'hover:scale-105 border border-transparent'
                }
                ${
                  darkMode
                    ? 'bg-[var(--darker)] hover:bg-gray-800'
                    : 'bg-white hover:bg-gray-50'
                }`}
            >
              {/* Icon + Title */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`p-2 rounded-lg ${
                    darkMode
                      ? 'bg-[var(--lightblue)] text-black'
                      : 'bg-[var(--blue)] text-white'
                  }`}
                >
                  <FaWpforms className="text-lg" />
                </div>
                <h3
                  className="font-bold text-sm truncate flex-1"
                  title={formName}
                >
                  {formName}
                </h3>
              </div>

              {/* Stats */}
              <div className="flex justify-between items-center mt-2">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    darkMode
                      ? 'bg-gray-700 text-gray-200'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {count} responses
                </span>
                <span className="text-xs opacity-70">
                  {feedbacks[0]?.createdAt
                    ? new Date(
                        feedbacks[0].createdAt
                      ).toLocaleDateString()
                    : '—'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom: selected form's table */}
      <div
        className={`mt-4 p-6 rounded-2xl shadow-lg transition-colors ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        }`}
      >
        {selectedFormId ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">
                {groupedFeedbacks[selectedFormId]?.[0]?.responses?.formName ||
                  'Untitled Form'}
              </h3>
              <p className="text-sm opacity-70">
                {groupedFeedbacks[selectedFormId].length} responses
              </p>
            </div>
            <FeedbackList feedbacks={groupedFeedbacks[selectedFormId]} />
          </>
        ) : (
          <p className="text-gray-400">
            Select a form above to view responses.
          </p>
        )}
      </div>
    </div>
  );
}
