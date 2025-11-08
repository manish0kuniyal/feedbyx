import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { sendChatQuery } from "../utils/api/chat";
import { FiUser } from "react-icons/fi";

export default function AIChat({ baseUrl, forms, darkMode }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedForm, setSelectedForm] = useState("");
  const [formName, setFormName] = useState("");

  useEffect(() => {
    if (forms?.length && !selectedForm) {
      const first = forms[0];
      setSelectedForm(first.customId);
      setFormName(first.name || "Untitled Form");
    }
  }, [forms]);

  useEffect(() => {
    if (!selectedForm) return;
    const cached = localStorage.getItem(`chat_${selectedForm}`);
    if (cached) setMessages(JSON.parse(cached));
  }, [selectedForm]);

  useEffect(() => {
    if (selectedForm) {
      localStorage.setItem(`chat_${selectedForm}`, JSON.stringify(messages));
    }
  }, [messages, selectedForm]);

  const handleSend = async () => {
    if (!input.trim() || !selectedForm) return;
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const answer = await sendChatQuery(baseUrl, selectedForm, input);
      const botMsg = { role: "bot", text: answer || "No response" };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: "Error fetching response" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const id = e.target.value;
    setSelectedForm(id);
    const f = forms.find((x) => x.customId === id);
    setFormName(f?.name || "Untitled Form");
  };

  return (
    <div
      className={`flex flex-col h-full   max-w-4xl mx-auto rounded-2xl shadow-md overflow-hidden ${
        darkMode ? " text-gray-100" : "bg-white text-gray-900"
      }`}
      style={{
        backgroundImage:
          "url('https://www.transparenttextures.com/patterns/cloudy-day.png')",
        backgroundSize: "contain",
      }}
    >
      <div
        className={`flex items-center justify-between px-4 py-3  border-b ${
          darkMode ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg tracking-tight">current form</span>
          <select
            value={selectedForm}
            onChange={handleFormChange}
            className={`px-3 py-2 rounded-md border text-sm font-medium ${
              darkMode
                ? "bg-black border-gray-700 text-gray-100 focus:border-[var(--lightblue)]"
                : "bg-white border-gray-300 text-gray-900 focus:border-[var(--lightblue)]"
            }`}
          >
            {forms?.length ? (
              forms.map((f) => (
                <option  key={f.customId} value={f.customId}>
                  {f.name || "Untitled Form"}
                </option>
              ))
            ) : (
              <option>No forms available</option>
            )}
          </select>
        </div>
        <div className="text-sm opacity-70 italic">
          {formName ? `${formName}` : "Please select a form"}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {messages.length === 0 && (
          <div className="text-center text-sm opacity-70 italic mt-10">
            Start chatting about this form’s feedback...
          </div>
        )}
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-end gap-2 ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.role === "bot" && (
              <img
                src="/logo.png"
                alt="AI"
                className="w-7 h-7 rounded-full shadow-md border border-transparent"
              />
            )}
            <div
              className={`p-3 rounded-2xl max-w-[70%] text-sm leading-relaxed shadow-sm ${
                m.role === "user"
                  ? "bg-[var(--blue)] text-white rounded-br-none"
                  : darkMode
                  ? " text-gray-100 border border-gray-800 rounded-bl-none"
                  : "bg-gray-100 text-gray-900 rounded-bl-none"
              }`}
            >
              {m.text}
            </div>
            {m.role === "user" && (
              <FiUser className="text-2xl text-gray-400 shrink-0" />
            )}
          </motion.div>
        ))}
        {loading && (
          <div className="text-sm italic text-gray-400">Thinking...</div>
        )}
      </div>

      <div
        className={`flex gap-2 p-3  mb-6 ${
          darkMode ? "" : ""
        }`}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className={`flex-1 px-3 py-2 rounded-md border text-sm ${
            darkMode
              ? "bg-black border-gray-800 text-gray-100"
              : "bg-white border-gray-300 text-gray-900"
          }`}
          placeholder={
            selectedForm
              ? "Ask something about this form’s feedback..."
              : "Please select a form first"
          }
          disabled={!selectedForm || loading}
        />
        <button
          onClick={handleSend}
          disabled={!selectedForm || loading}
          className={`px-4 py-2 rounded-md text-white font-medium text-sm shadow ${
            !selectedForm || loading
              ? "opacity-60 cursor-not-allowed"
              : "hover:opacity-90"
          }`}
          style={{ backgroundColor: "var(--lightblue)" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
