import { useState, useRef, useEffect } from "react";
import { FiMoreHorizontal, FiTrash2, FiExternalLink, FiPause } from "react-icons/fi";
import { ImEmbed2 } from "react-icons/im";
import { RxValueNone } from "react-icons/rx";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore } from "../utils/themestore";
import toast from "react-hot-toast";

export default function FeedbackCard({ form, setEmbedForm, setShareForm, onDelete, onUpdate }) {
  const darkMode = useThemeStore((s) => s.darkMode);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  const [isSettingLimit, setIsSettingLimit] = useState(false);
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

  const created = form.createdAt ? new Date(form.createdAt).toLocaleString() : "—";
  const idText = form.customId || form.id || "—";

  const patchForm = async (id, payload) => {
    const base = import.meta.env.VITE_BASE_URL || "/";
    const url = `${base.replace(/\/+$/, "")}/api/forms/${encodeURIComponent(id)}`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error || `Request failed (${res.status})`);
    }
    return await res.json();
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    const id = form.id || form.customId;
    if (!id) {
      toast.error("Form ID not found.");
      return;
    }

    const ok = window.confirm(`Delete "${form.name || "Untitled"}"? This will remove the form and all feedback permanently.`);
    if (!ok) return;

    try {
      setIsDeleting(true);

      const base = import.meta.env.VITE_BASE_URL || "/";
      const url = `${base.replace(/\/+$/, "")}/api/forms/${encodeURIComponent(id)}`;

      const res = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("Form and feedback deleted.");
        if (typeof onDelete === "function") onDelete(id);
        setTimeout(() => window.location.reload(), 700);
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || `Delete failed (${res.status})`);
      }
    } catch (e) {
      console.error("Delete error:", e);
      toast.error("Network error while deleting form.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePauseToggle = async () => {
    setMenuOpen(false);
    const id = form.id || form.customId;
    if (!id) {
      toast.error("Form ID not found.");
      return;
    }

    const newPaused = !Boolean(form.paused);
    try {
      setIsPausing(true);
      const resp = await patchForm(id, { paused: newPaused });
      toast.success(newPaused ? "Form paused — it will stop accepting feedback." : "Form unpaused — accepting feedback again.");
      const updated = resp?.form ? resp.form : { ...form, paused: newPaused };
      if (typeof onUpdate === "function") onUpdate(updated);
    } catch (err) {
      console.error("Pause toggle error:", err);
      toast.error(err?.message || "Failed to update pause state.");
    } finally {
      setIsPausing(false);
    }
  };

  const handleSetLimit = async () => {
    setMenuOpen(false);
    const id = form.id || form.customId;
    if (!id) {
      toast.error("Form ID not found.");
      return;
    }

    const current = form.feedbackLimit == null ? "" : String(form.feedbackLimit);
    const raw = window.prompt("Set maximum number of feedbacks for this form.\nEnter a positive integer, or leave empty to clear the limit.", current);

    if (raw === null) return;

    const trimmed = raw.trim();
    let payload;
    if (trimmed === "") {
      payload = { feedbackLimit: null };
    } else {
      const n = Number(trimmed);
      if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
        toast.error("Please enter a valid non-negative integer (or leave empty to clear).");
        return;
      }
      payload = { feedbackLimit: Math.floor(n) };
    }

    try {
      setIsSettingLimit(true);
      const resp = await patchForm(id, payload);
      const updated = resp?.form ? resp.form : { ...form, feedbackLimit: payload.feedbackLimit };
      toast.success(payload.feedbackLimit == null ? "Feedback limit cleared." : `Limit set to ${payload.feedbackLimit}.`);
      if (typeof onUpdate === "function") onUpdate(updated);
    } catch (err) {
      console.error("Set limit error:", err);
      toast.error(err?.message || "Failed to set feedback limit.");
    } finally {
      setIsSettingLimit(false);
    }
  };

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

          <div className="mt-1 flex items-center gap-2">
            {form.paused && (
              <div className={`text-xs px-2 py-0.5 rounded-full font-medium ${darkMode ? 'bg-white/6 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
                Paused
              </div>
            )}
            {typeof form.feedbackLimit === "number" && (
              <div className={`text-xs px-2 py-0.5 rounded-full font-medium ${darkMode ? 'bg-white/6 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
                Limit: {form.feedbackLimit}
              </div>
            )}
          </div>

          <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
                className={`absolute right-0 mt-2 w-48 rounded-lg overflow-hidden z-20
                  ${darkMode ? 'bg-[var(--darker)] border border-gray-700 shadow-lg' : 'bg-white border border-gray-100 shadow-lg'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 ${isDeleting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50 hover:text-red-600 dark:hover:bg-white/6'}`}
                >
                  <FiTrash2 /> {isDeleting ? "Deleting..." : "Delete"}
                </button>

                <button
                  onClick={handlePauseToggle}
                  disabled={isPausing}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 ${isPausing ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-white/6'}`}
                >
                  <FiPause /> {isPausing ? (form.paused ? "Unpausing..." : "Pausing...") : (form.paused ? "Unpause" : "Pause")}
                </button>

                <button
                  onClick={handleSetLimit}
                  disabled={isSettingLimit}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 ${isSettingLimit ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-white/6'}`}
                >
                  <RxValueNone /> Set limit
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
