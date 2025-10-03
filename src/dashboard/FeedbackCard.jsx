import { useState, useRef, useEffect } from "react";
import { FiMoreHorizontal, FiTrash2, FiExternalLink } from "react-icons/fi";
import { ImEmbed2 } from "react-icons/im";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore } from "../utils/themestore";

export default function FeedbackCard({ form, setEmbedForm, setShareForm, onDelete }) {
  const darkMode = useThemeStore((s) => s.darkMode);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    window.addEventListener("click", handleOutside);
    return () => window.removeEventListener("click", handleOutside);
  }, []);

  const handleOpenLink = () => {
    if (typeof setShareForm === "function") setShareForm(form);
  };

  const handleOpenCode = () => {
    if (typeof setEmbedForm === "function") setEmbedForm({ ...form, showCodeOnly: true });
  };

  const handleDelete = () => {
    setMenuOpen(false);
    const id = form.id || form.customId;
    if (!id) return;
    if (confirm(`Delete "${form.name || "Untitled"}"? This will only remove it from the UI until you add a backend.`)) {
      if (typeof onDelete === "function") onDelete(id);
    }
  };

  const created = form.createdAt ? new Date(form.createdAt).toLocaleString() : "—";
  const idText = form.customId || form.id || "—";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className={`relative flex flex-col  justify-between p-5 rounded-2xl border 
        ${darkMode ? 'bg-[var(--darker)] border-gray-700 text-gray-100 shadow-sm' : 'bg-white border-gray-100 text-gray-900 shadow-md'}`}
      style={{ minWidth: 280 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold truncate">{form.name || "Untitled form"}</h3>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            ID: <span className="font-mono text-xs">{idText}</span>
          </p>
        </div>

        <div ref={menuRef} className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((s) => !s); }}
            aria-label="Open actions"
            className={`p-1.5 rounded-full transition ${darkMode ? 'bg-white/5 hover:bg-white/8' : 'bg-white shadow-sm hover:shadow'}`}
          >
            <FiMoreHorizontal className="text-sm" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -6 }}
                className={`absolute right-0 mt-2 w-40 rounded-lg overflow-hidden z-20
                  ${darkMode ? 'bg-[var(--darker)] border border-gray-700 shadow-lg' : 'bg-white border border-gray-100 shadow-lg'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-red-50 hover:text-red-600"
                >
                  <FiTrash2 /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className={`inline-block text-[12px] px-3 py-1 rounded-full ${darkMode ? 'bg-white/6 text-gray-200' : 'bg-gray-200 text-gray-700'}`}>
            {created}
          </div>
        </div>

        {form.description && (
          <p className={`hidden sm:block text-sm ml-4 truncate ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} style={{ maxWidth: 300 }}>
            {form.description}
          </p>
        )}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={handleOpenLink}
          className={`flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg font-semibold text-sm transition
            ${darkMode
              ? 'bg-[var(--lightblue)] text-gray-900 hover:bg-[var(--blue)]'
              : 'bg-[var(--blue)] text-white hover:bg-[var(--lightblue)]'}`}
        >
          <FiExternalLink /> Link
        </button>

        <button
          onClick={handleOpenCode}
          className={`flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg font-medium text-sm border transition
            ${darkMode
              ? 'border-gray-600 text-gray-300 hover:text-[var(--blue)]'
              : 'border-gray-200 text-gray-700 hover:text-[var(--blue)]'}`}
        >
          <ImEmbed2 /> Code
        </button>
      </div>

    </motion.article>
  );
}
