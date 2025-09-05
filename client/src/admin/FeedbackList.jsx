export default function FeedbackList({ feedbacks }) {
  return (
    <div className="mt-4 space-y-4">
     {feedbacks.map((fb, idx) => (
  <div key={fb._id || idx} className="bg-gray-50 p-4 rounded-lg">
    <div className="flex justify-between">
      <div>
        <p className="font-semibold text-gray-800">{fb.name}</p>
        <p className="text-sm text-gray-500">{fb.email}</p>
      </div>
      <p className="text-yellow-500">
        {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
      </p>
    </div>
    <p className="mt-2 text-gray-700">{fb.feedback}</p>
    <p className="text-xs text-gray-400 text-right">
      {fb.createdAt
        ? new Date(fb.createdAt).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })
        : 'Unknown date'}
    </p>
  </div>
))}

    </div>
  );
}
