'use client';
import { useState } from "react";

export default function ShareLinkModal({ form, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!form) return null;

  const link = `${process.env.NEXT_PUBLIC_BASE_URL}/forms/${form.customId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-gray-800 text-gray-100 p-6 rounded-2xl shadow-lg w-[400px]">
        <h2 className="text-lg font-semibold mb-3 text-center">
          Share Form Link
        </h2>

        <div className="flex items-center gap-2">
          <input
            readOnly
            value={link}
            className="flex-1 border border-[var(--lightblue)] rounded px-3 py-2 text-sm bg-gray-900 text-white"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-2 bg-[var(--blue)] hover:bg-[var(--lightblue)] text-white rounded transition"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
