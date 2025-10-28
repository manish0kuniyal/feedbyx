import { useState, useRef, useEffect } from "react"
import { FiMoreHorizontal, FiTrash2, FiExternalLink, FiPause } from "react-icons/fi"
import { ImEmbed2 } from "react-icons/im"
import { RxValueNone, RxCrossCircled } from "react-icons/rx"
import { CiCircleCheck } from "react-icons/ci"
import { motion, AnimatePresence } from "framer-motion"
import { useThemeStore } from "../utils/themestore"

const Alert = ({ children, className }) => <div className={className}>{children}</div>

export default function FeedbackCard({ form, setEmbedForm, setShareForm, onDelete, onUpdate }) {
  const darkMode = useThemeStore((s) => s.darkMode)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPausing, setIsPausing] = useState(false)
  const [isSettingLimit, setIsSettingLimit] = useState(false)
  const [limitModalOpen, setLimitModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [tempLimit, setTempLimit] = useState("")
  const [limitError, setLimitError] = useState("")
  const [alert, setAlert] = useState({ show: false, color: "", title: "", description: "" })
  const menuRef = useRef()

  const showAlert = (color, title, description) => {
    setAlert({ show: true, color, title, description })
    setTimeout(() => setAlert({ show: false }), 3000)
  }

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    window.addEventListener("click", handleOutside)
    return () => window.removeEventListener("click", handleOutside)
  }, [])

  const handleOpenLink = () => {
    if (typeof setShareForm === "function") setShareForm(form)
  }

  const handleOpenCode = () => {
    if (typeof setEmbedForm === "function") setEmbedForm({ ...form, showCodeOnly: true })
  }

  const created = form.createdAt ? new Date(form.createdAt).toLocaleString() : "—"
  const idText = form.customId || form.id || "—"

  const patchForm = async (id, payload) => {
    const base = import.meta.env.VITE_BASE_URL || "/"
    const url = `${base.replace(/\/+$/, "")}/api/forms/${encodeURIComponent(id)}`
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => null)
      throw new Error(err?.error || `Request failed (${res.status})`)
    }
    return await res.json()
  }

  const handleDelete = async () => {
    const id = form.id || form.customId
    if (!id) {
      showAlert("danger", "Delete Failed", "Form ID not found")
      return
    }
    try {
      setIsDeleting(true)
      const base = import.meta.env.VITE_BASE_URL || "/"
      const url = `${base.replace(/\/+$/, "")}/api/forms/${encodeURIComponent(id)}`
      const res = await fetch(url, { method: "DELETE", headers: { "Content-Type": "application/json" } })
      if (res.ok) {
        if (typeof onDelete === "function") onDelete(id)
        showAlert("success", "Form Deleted", "The form has been deleted successfully")
        setTimeout(() => window.location.reload(), 1000)
      } else {
        showAlert("danger", "Delete Failed", "Unable to delete form")
      }
    } catch {
      showAlert("danger", "Network Error", "Failed to delete form")
    } finally {
      setIsDeleting(false)
      setDeleteModalOpen(false)
    }
  }

  const handlePauseToggle = async () => {
    const id = form.id || form.customId
    if (!id) {
      showAlert("danger", "Action Failed", "Form ID not found")
      return
    }
    const newPaused = !Boolean(form.paused)
    try {
      setIsPausing(true)
      const resp = await patchForm(id, { paused: newPaused })
      const updated = resp?.form ? resp.form : { ...form, paused: newPaused }
      if (typeof onUpdate === "function") onUpdate(updated)
      showAlert("success", newPaused ? "Form Paused" : "Form Resumed", "Status updated successfully")
      setTimeout(() => window.location.reload(), 1000)
    } catch {
      showAlert("danger", "Failed", "Unable to update pause state")
    } finally {
      setIsPausing(false)
    }
  }

  const openSetLimitModal = () => {
    setMenuOpen(false)
    setTimeout(() => {
      const current = form.feedbackLimit == null ? "" : String(form.feedbackLimit)
      setTempLimit(current)
      setLimitError("")
      setLimitModalOpen(true)
    }, 0)
  }

  const submitLimit = async () => {
    const id = form.id || form.customId
    if (!id) {
      setLimitError("Form ID missing")
      return
    }
    const trimmed = String(tempLimit).trim()
    const MIN = 0
    const MAX = 100000
    let payload
    if (trimmed === "") {
      payload = { feedbackLimit: null }
    } else {
      const n = Number(trimmed)
      if (!Number.isFinite(n) || !Number.isInteger(n)) {
        setLimitError("Please enter a whole number")
        return
      }
      if (n < MIN || n > MAX) {
        setLimitError(`Value must be between ${MIN} and ${MAX}`)
        return
      }
      payload = { feedbackLimit: Math.floor(n) }
    }
    try {
      setIsSettingLimit(true)
      const resp = await patchForm(id, payload)
      const updated = resp?.form ? resp.form : { ...form, feedbackLimit: payload.feedbackLimit }
      if (typeof onUpdate === "function") onUpdate(updated)
      setLimitModalOpen(false)
      showAlert("success", "Updated Successfully", "Feedback limit updated successfully")
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      showAlert("danger", "Update Failed", err?.message || "Failed to set feedback limit")
    } finally {
      setIsSettingLimit(false)
    }
  }

  return (
    <>
      <motion.article
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        className={`relative flex flex-col justify-between p-5 rounded-2xl border 
          ${darkMode ? 'bg-[var(--darker)] border-gray-700 text-gray-100 shadow-sm' : 'bg-white border-gray-100 text-gray-900 shadow-md'}`}
        style={{ minWidth: 280 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold truncate">{form.name || "Untitled form"}</h3>
            <div className="mt-1 flex items-center gap-2">
              {form.paused && (
                <div className={`text-xs px-2 py-0.5 rounded-full font-medium ${darkMode ? 'bg-white/6 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>Paused</div>
              )}
              {typeof form.feedbackLimit === "number" && (
                <div className={`text-xs px-2 py-0.5 rounded-full font-medium ${darkMode ? 'bg-white/6 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>Limit: {form.feedbackLimit}</div>
              )}
            </div>
            <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>ID: <span className="font-mono text-xs">{idText}</span></p>
          </div>

          <div ref={menuRef} className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((s) => !s) }}
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
                  <button onClick={() => setDeleteModalOpen(true)} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 hover:text-red-600 dark:hover:bg-white/6">
                    <FiTrash2 /> Delete
                  </button>
                  <button onClick={handlePauseToggle} disabled={isPausing} className={`w-full text-left px-4 py-3 flex items-center gap-3 ${isPausing ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-white/6'}`}>
                    <FiPause /> {form.paused ? "Unpause" : "Pause"}
                  </button>
                  <button onClick={openSetLimitModal} disabled={isSettingLimit} className={`w-full text-left px-4 py-3 flex items-center gap-3 ${isSettingLimit ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-white/6'}`}>
                    <RxValueNone /> Set limit
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div><div className={`inline-block text-[12px] px-3 py-1 rounded-full ${darkMode ? 'bg-white/6 text-gray-200' : 'bg-gray-200 text-gray-700'}`}>{created}</div></div>
          {form.description && <p className={`hidden sm:block text-sm ml-4 truncate ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} style={{ maxWidth: 300 }}>{form.description}</p>}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button onClick={handleOpenLink} className={`flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg font-semibold text-sm transition ${darkMode ? 'bg-[var(--lightblue)] text-gray-900 hover:bg-[var(--blue)]' : 'bg-[var(--blue)] text-white hover:bg-[var(--lightblue)]'}`}><FiExternalLink /> Link</button>
          <button onClick={handleOpenCode} className={`flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg font-medium text-sm border transition ${darkMode ? 'border-gray-600 text-gray-300 hover:text-[var(--blue)]' : 'border-gray-200 text-gray-700 hover:text-[var(--blue)]'}`}><ImEmbed2 /> Code</button>
        </div>
      </motion.article>

      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteModalOpen(false)} />
            <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }} transition={{ duration: 0.18 }} className={`relative z-10 max-w-md w-full mx-4 rounded-xl p-6 shadow-2xl ${darkMode ? 'bg-[#0b0b0b] text-gray-100' : 'bg-white text-gray-900'}`}>
              <h3 className="text-lg font-semibold mb-3">Delete Form</h3>
              <p className="text-sm mb-4 text-gray-500">Are you sure you want to permanently delete this form? This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setDeleteModalOpen(false)} className={`px-3 py-2 rounded text-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} disabled={isDeleting}>Cancel</button>
                <button onClick={handleDelete} className={`px-4 py-2 rounded text-sm font-semibold ${isDeleting ? 'opacity-60 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`} disabled={isDeleting}>{isDeleting ? "Deleting..." : "Delete"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {limitModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => { if (!isSettingLimit) setLimitModalOpen(false) }} />
            <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }} transition={{ duration: 0.18 }} className={`relative z-10 max-w-md w-full mx-4 rounded-xl p-5 shadow-2xl ${darkMode ? 'bg-[#0b0b0b] text-gray-100' : 'bg-white text-gray-900'}`}>
              <h3 className="text-lg font-semibold mb-2">Set feedback limit</h3>
              <p className="text-sm mb-3 text-gray-500">Enter a non-negative integer, or leave empty to clear the limit.</p>
              <label className="block text-sm mb-1">Maximum feedbacks (0 - 100000)</label>
              <input type="number" inputMode="numeric" min={0} max={100000} step={1} value={tempLimit} onChange={(e) => { setTempLimit(e.target.value); setLimitError("") }} className={`w-full px-3 py-2 rounded border outline-none mb-2 ${darkMode ? 'bg-[#111214] border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`} placeholder="Leave empty to clear" disabled={isSettingLimit} />
              {limitError && <div className="text-sm text-red-500 mb-2">{limitError}</div>}
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setLimitModalOpen(false)} className={`px-3 py-2 rounded text-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} disabled={isSettingLimit}>Cancel</button>
                <button onClick={submitLimit} className={`px-4 py-2 rounded text-sm font-semibold ${isSettingLimit ? 'opacity-60 cursor-not-allowed' : (darkMode ? 'bg-[var(--lightblue)] text-black' : 'bg-[var(--blue)] text-white')}`} disabled={isSettingLimit}>{isSettingLimit ? "Saving..." : "Save"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {alert.show && (
          <motion.div initial={{ opacity: 0, x: 120 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 120 }} transition={{ duration: 0.4, ease: "easeOut" }} className="fixed top-6 right-6 z-50">
            <Alert className={`flex items-start gap-3 w-[28rem] rounded-xl p-5 shadow-2xl transition-colors ${darkMode ? alert.color === 'danger' ? 'bg-[#2c1a1a] text-red-300' : 'bg-[#2e2c2c] text-emerald-100' : alert.color === 'danger' ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'}`}>
              <div className="flex items-start gap-3">
                {alert.color === 'danger' ? <RxCrossCircled className="text-2xl flex-shrink-0 text-red-500 dark:text-red-400" /> : <CiCircleCheck className="text-2xl flex-shrink-0 text-emerald-600 dark:text-emerald-400" />}
                <div>
                  <h4 className="font-semibold text-base mb-1">{alert.title}</h4>
                  <p className="text-sm opacity-90">{alert.description}</p>
                </div>
              </div>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
