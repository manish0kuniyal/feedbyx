'use client';
import FeedbackForm from '../components/FormCreator/FeedbackForm';
import { useEffect } from 'react';

export default function Modal({ embedForm, setEmbedForm, darkMode }) {
  useEffect(() => {
    if (embedForm) {
      console.log("✅ name:", embedForm.name);
      console.log('[Modal] embedForm:', embedForm, "ok");
    }
  }, [embedForm]);

  if (!embedForm) return null;

  const APP_URL = window.location.origin;

  const embedCode = `
<div id="feedback-widget-container"></div>
<script src="${APP_URL}/embed.js" data-form-id="${embedForm?.customId}"></script>
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode.trim());
    alert('✅ Embed code copied to clipboard!');
  };

  return (
    <div
      className={`fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm ${
        darkMode ? 'bg-black/60' : 'bg-gray-100/60'
      }`}
    >
      <div
        className={`p-6 rounded-2xl shadow-2xl max-w-lg w-full relative border ${
          darkMode
            ? 'bg-gradient-to-br from-[#0f172a]/90 to-[#1e293b]/80 border-gray-700 text-gray-100'
            : 'bg-gradient-to-br from-white/90 to-gray-100/80 border-gray-300 text-gray-900'
        }`}
      >
        <h2 className="text-2xl font-bold mb-4 tracking-tight">
          {embedForm.showCodeOnly ? 'Embed Code' : `Preview: ${embedForm.name}`}
        </h2>

        {embedForm.showCodeOnly ? (
          <>
            <p
              className={`text-sm mb-3 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Copy this script and paste it into any HTML page:
            </p>

            <pre
              className={`p-4 rounded-lg text-sm overflow-auto border ${
                darkMode
                  ? 'bg-black/40 text-gray-200 border-gray-700'
                  : 'bg-gray-50 text-gray-800 border-gray-200'
              }`}
            >
{embedCode}
            </pre>

            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={handleCopy}
                className="px-5 py-2 rounded-md font-medium text-white shadow-md transition hover:opacity-90"
                style={{ backgroundColor: 'var(--blue)' }}
              >
                Copy Code
              </button>
              <button
                onClick={() => setEmbedForm(null)}
                className={`px-5 py-2 rounded-md font-medium transition shadow-sm ${
                  darkMode
                    ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <div
              className={`p-4 rounded-lg border ${
                darkMode
                  ? 'bg-black/40 border-gray-700'
                  : 'bg-white/70 border-gray-200'
              }`}
            >
              <FeedbackForm formId={embedForm.id} />
            </div>
            <div className="flex justify-end mt-5">
              <button
                onClick={() => setEmbedForm(null)}
                className={`px-5 py-2 rounded-md font-medium transition shadow-sm ${
                  darkMode
                    ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}