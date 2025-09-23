'use client';

import { motion } from 'framer-motion';
import { useThemeStore } from '../utils/themestore';
export function toPlainObject(maybeMap) {
  if (!maybeMap) return {};
  // if it's already an object
  if (typeof maybeMap === 'object' && !Array.isArray(maybeMap)) {
    // Mongoose lean() sometimes returns plain object, sometimes array entries; handle common cases
    if (maybeMap instanceof Map) {
      return Object.fromEntries(maybeMap);
    }
    // if it's an array of entries: [ [k,v], [k2,v2] ]
    if (Array.isArray(maybeMap)) {
      try {
        return Object.fromEntries(maybeMap);
      } catch {
        return maybeMap;
      }
    }
    return maybeMap;
  }
  return {};
}
export default function FeedbackList({ feedbacks }) {
  const darkMode = useThemeStore((s) => s.darkMode);

  if (!feedbacks || feedbacks.length === 0) {
    return <p className="text-gray-400">No responses yet.</p>;
  }

  // Extract field keys
  const example = feedbacks[0].responses || {};
  const preferredOrder = ['name', 'email', 'rating', 'feedback', 'createdAt'];
  const otherKeys = Object.keys(example).filter((k) => k !== 'formId');
  const ordered = [
    ...preferredOrder.filter((k) => otherKeys.includes(k)),
    ...otherKeys.filter((k) => !preferredOrder.includes(k)).sort(),
  ];

  const renderValue = (key, value) => {
    if (value === null || value === undefined) return '-';
    if (key.toLowerCase().includes('rating') || key === 'rating') {
      const rating = parseInt(value) || 0;
      return (
        <span className="text-yellow-400">
          {'★'.repeat(rating)}
          {'☆'.repeat(5 - rating)}
        </span>
      );
    }
    if (key.toLowerCase().includes('date') || key === 'createdAt' || key === 'created_at') {
      try {
        return new Date(value).toLocaleString();
      } catch {
        return value;
      }
    }
    return value;
  };

  const tableBg = darkMode ? 'bg-gray-900 ' : 'bg-white ';
  const headerBg = 'bg-[var(--blue)] text-white';
  const rowEvenBg = darkMode ? '' : 'bg-white';
  const rowOddBg = darkMode ? 'bg-[#111]' : 'bg-gray-50';

  return (
    <motion.div
      className={`mt-4 overflow-x-auto p-4 rounded-xl shadow-sm ${tableBg}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <table className="min-w-full rounded-lg overflow-hidden">
        <thead className={`${headerBg} sticky top-0`}>
          <tr>
            {ordered.map((key) => (
              <th key={key} className="px-4 py-3 text-left text-sm font-semibold capitalize">
                {key.replace(/[-_]/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {feedbacks.map((fb, idx) => (
            <tr
              key={fb._id || idx}
              className={`transition-colors hover:bg-gray-100 ${
                idx % 2 === 0 ? rowEvenBg : rowOddBg
              }`}
            >
              {ordered.map((key) => (
                <td key={key} className={`px-4 py-3 align-top text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {renderValue(key, fb.responses[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
