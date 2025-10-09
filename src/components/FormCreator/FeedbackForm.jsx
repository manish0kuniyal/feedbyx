// src/components/FeedbackForm.jsx
import { useState } from "react";

export default function FeedbackForm({ formId, formName = "Feedback" }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: "5",
    feedback: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const api = (path) => {
    const base = (import.meta.env.VITE_BASE_URL || "/").replace(/\/+$/, "");
    return `${base}/${path.replace(/^\/+/, "")}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const extractErrorMessage = (maybe) => {
    if (!maybe) return "Unknown error";
    if (typeof maybe === "string") return maybe;
    if (maybe.error) return typeof maybe.error === "string" ? maybe.error : JSON.stringify(maybe.error);
    if (maybe.message) return typeof maybe.message === "string" ? maybe.message : JSON.stringify(maybe.message);
    try { return JSON.stringify(maybe); } catch { return String(maybe); }
  };

  const stopPropagationForInput = (e) => {
    try {
      e.stopPropagation();
      if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === "function") {
        e.nativeEvent.stopImmediatePropagation();
      }
    } catch (err) {}
  };

  const inputShared = {
    onKeyDownCapture: stopPropagationForInput,
    onKeyDown: stopPropagationForInput,
    onKeyPressCapture: stopPropagationForInput,
    onKeyPress: stopPropagationForInput,
    onFocus: () => (window.__feedbackInputFocused = true),
    onBlur: () => (window.__feedbackInputFocused = false),
    spellCheck: true,
    autoComplete: "on",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const responses = {
        name: formData.name,
        email: formData.email,
        rating: formData.rating,
        feedback: formData.feedback,
      };

      const payload = { formId, formName, responses, metadata: {} };

      const res = await fetch(api("api/feedback"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text().catch(() => null);
      let json = null;
      try { json = text ? JSON.parse(text) : null; } catch (err) { json = null; }

      console.debug("Feedback POST debug:", { status: res.status, ok: res.ok, text, json });

      if (res.ok) {
        setMessage({ text: "Thank you for your feedback!", type: "success" });
        setFormData({ name: "", email: "", rating: "5", feedback: "" });
      } else {
        // prefer friendly server message: json.error || json.message || text
        const errMsg = json ? extractErrorMessage(json) : (text || `Failed to submit feedback (${res.status})`);
        setMessage({ text: errMsg, type: "error" });
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setMessage({ text: "Error submitting feedback. Please try again.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-white border border-gray-200 rounded-xl shadow space-y-4">
      {message.text && (
        <div className={`p-3 rounded text-sm ${message.type === "success" ? "bg-green-100 border border-green-400 text-green-700" : "bg-red-100 border border-red-400 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input {...inputShared} type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Your name" />
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input {...inputShared} type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md" placeholder="you@example.com" inputMode="email" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
        <div className="flex gap-1 text-2xl cursor-pointer select-none" role="group" tabIndex={-1} onKeyDownCapture={stopPropagationForInput}>
          {[1,2,3,4,5].map((s) => (
            <span key={s} role="button" tabIndex={0}
              onClick={() => setFormData(p => ({ ...p, rating: String(s) }))}
              onKeyDown={(ev) => { if (ev.key === " " || ev.key === "Enter") { ev.preventDefault(); setFormData(p => ({ ...p, rating: String(s) })); } stopPropagationForInput(ev); }}
              onKeyDownCapture={stopPropagationForInput}
              className={`transition ${s <= Number(formData.rating) ? "text-yellow-400" : "text-gray-300"} hover:scale-110`}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
        <textarea {...inputShared} name="feedback" value={formData.feedback} onChange={handleChange} rows="4" required className="w-full p-2 border border-gray-300 rounded-md" placeholder="Write your thoughts..." />
      </div>

      <div className="pt-2">
        <button type="submit" disabled={isSubmitting} className="bg-[#9ACD32] text-black font-semibold px-6 py-2 rounded hover:opacity-90 transition disabled:bg-gray-400">
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
}
