'use client';
import FeedbackForm from '../components/FormCreator/FeedbackForm';
import { useEffect } from 'react';
export default function Modal({ embedForm, setEmbedForm }) {
 useEffect(() => {
  if (embedForm) {
    console.log("✅ name:", embedForm.name);
    console.log('[Modal] embedForm:', embedForm, "ok");
  } else {
    console.log('[Modal] embedForm is null');
  }
}, [embedForm]); 

if (!embedForm) {return null;}
  const handleCopy = () => {
    const code = `<script src="https://feedbackapp2-7r27.onrender.com/embed.js" data-form-id="${embedForm?.customId}"></script>`;
    navigator.clipboard.writeText(code);
    alert('Embed code copied!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full relative">
        <h2 className="text-xl font-bold mb-4">
          {embedForm.showCodeOnly ? 'Embed Code' : `Preview: ${embedForm.name}`}
        </h2>

        {embedForm.showCodeOnly ? (
          <>
            <p className="text-sm text-gray-700 mb-2">
              Copy this script and paste it into any HTML page:
            </p>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">

{`

  <div id="feedback-widget-container"></div>
<script src="https://feedbackapp2.vercel.app/embed.js" data-form-id="${embedForm?.customId}"></script>`}
            </pre>
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={handleCopy}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Copy Code
              </button>
              <button
                onClick={() => setEmbedForm(null)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <FeedbackForm formId={embedForm.id} />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setEmbedForm(null)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
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
