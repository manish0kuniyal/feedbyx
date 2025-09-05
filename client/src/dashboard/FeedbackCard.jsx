'use client';
import { useThemeStore } from '../utils/themestore';
import { FaLink } from "react-icons/fa";
import { ImEmbed2 } from "react-icons/im";

export default function FeedbackCard({ form, setEmbedForm, setShareForm }) {
  const darkMode = useThemeStore((state) => state.darkMode);

  const handleOpenLink = () => {
    if (typeof setShareForm === 'function') setShareForm(form); // ✅ guard
  };

  const handleOpenCode = () => {
    setEmbedForm({ ...form, showCodeOnly: true });              // ✅ fixed
  };

  return (
    <div
      className={`p-5 rounded border shadow-sm hover:shadow-md transition-all flex flex-col justify-between
        ${darkMode ? 'border-gray-700' : 'bg-white border-gray-200'}`}
    >
      <div>
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          {form.name}
        </h3>
        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          ID: {String(form.customId || '🚫 customId missing')}
        </p>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={handleOpenLink}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow transition-colors
            ${darkMode
              ? 'bg-[var(--lightblue)] text-gray-900 hover:bg-[var(--blue)]'
              : 'bg-[var(--blue)] text-white hover:bg-[var(--lightblue)]'}`}
        >
          <FaLink className="text-sm" />
          Link
        </button>

        <button
          onClick={handleOpenCode}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors
            ${darkMode
              ? 'border-gray-600 text-gray-300 hover:text-[var(--blue)]'
              : 'border-gray-300 text-gray-700 hover:text-[var(--blue)]'}`}
        >
          <ImEmbed2 className="text-base" />
          Code
        </button>
      </div>
    </div>
  );
}
