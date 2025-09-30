export default function StarRatingField({ label, onLabelChange }) {
  return (
    <div className="mb-2">
      <input
        className="block text-sm font-medium mb-1 w-full border px-2 py-1 rounded"
        placeholder="Enter label..."
        value={label}
        onChange={(e) => onLabelChange(e.target.value)}
      />
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="text-yellow-500 text-xl cursor-pointer">
            ★
          </span>
        ))}
      </div>
    </div>
  );
}
