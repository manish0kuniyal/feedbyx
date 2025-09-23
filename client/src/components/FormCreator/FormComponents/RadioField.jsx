import { FaTrash } from 'react-icons/fa';

export default function RadioField({ label = '', onLabelChange, options = [], onOptionsChange }) {
  const handleLabelChange = (e) => {
    onLabelChange?.(e.target.value);
  };

  const handleOptionChange = (value, idx) => {
    const updated = [...options];
    updated[idx] = value;
    onOptionsChange?.(updated);
  };

  const handleAddOption = () => {
    const updated = [...options, `Option ${options.length + 1}`];
    onOptionsChange?.(updated);
  };

  const handleRemoveOption = (idx) => {
    const updated = options.filter((_, i) => i !== idx);
    onOptionsChange?.(updated);
  };

  return (
    <div className="mb-4">
      <input
        value={label}
        onChange={handleLabelChange}
        placeholder="Enter label..."
        className="mb-2 w-full border p-2 rounded"
      />
      {options.map((opt, idx) => (
        <div key={idx} className="flex items-center gap-2 mb-1">
          <input type="radio" disabled />
          <input
            type="text"
            value={opt}
            onChange={(e) => handleOptionChange(e.target.value, idx)}
            className="px-2 py-1 rounded w-full"
          />
          <button
            type="button"
            onClick={() => handleRemoveOption(idx)}
            className="text-[var(--lightblue)] hover:text-red-300"
          >
            <FaTrash size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddOption}
        className="text-sm text-[var(--lightblue)] hover:underline mt-1"
      >
        + Add Option
      </button>
    </div>
  );
}
