export default function TextAreaField({ label, onLabelChange }) {
  return (
    <div className="mb-2">
      <input
        className="block text-sm font-medium mb-1 w-full border px-2 py-1 rounded"
        placeholder="Enter label..."
        value={label}
        onChange={(e) => onLabelChange(e.target.value)}
      />
      <textarea
        className="border px-2 py-1 w-full rounded"
        placeholder="Enter text"
      />
    </div>
  );
}
