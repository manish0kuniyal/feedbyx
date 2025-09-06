'use client';

export default function FeedbackList({ feedbacks }) {
  if (!feedbacks || feedbacks.length === 0) {
    return <p className="text-gray-400">No responses yet.</p>;
  }

  // Extract field keys, skipping formId
  const fieldKeys = Object.keys(feedbacks[0].responses).filter(
    (key) => key !== 'formId'
  );

  // Helper for rendering stars if field is rating
  const renderValue = (key, value) => {
    if (key.toLowerCase().includes('rating') || key === 'rating') {
      const rating = parseInt(value) || 0;
      return (
        <span className="text-yellow-400">
          {'★'.repeat(rating)}
          {'☆'.repeat(5 - rating)}
        </span>
      );
    }
    return value;
  };

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full border border-gray-700 divide-y divide-gray-700 rounded-lg">
        <thead
          className="bg-[var(--blue)] text-[var(--white)]"
        >
          <tr>
            {fieldKeys.map((key) => (
              <th
                key={key}
                className="px-4 py-3 text-left text-sm font-semibold"
              >
                {key.replace(/-/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {feedbacks.map((fb, idx) => (
            <tr
              key={idx}
              className="hover:bg-[var(--darker)] transition-colors"
            >
              {fieldKeys.map((key) => (
                <td
                  key={key}
                  className="px-4 py-2 text-sm text-[var(--white)]"
                >
                  {renderValue(key, fb.responses[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
