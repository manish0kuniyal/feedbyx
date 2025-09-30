export default function EmailField({ label = '' }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label || 'Email '}</label>
      <input
        type="email"
        placeholder="Enter your email"
        className="border px-3 py-1 w-full rounded"
      />
    </div>
  );
}
