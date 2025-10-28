import { useState } from 'react';
import { useThemeStore } from '../../utils/themestore';
import { FiChevronRight, FiChevronLeft, FiCheck } from 'react-icons/fi';
import { MdOutlineMail } from "react-icons/md";
import { IoMdRadioButtonOn } from "react-icons/io";
import { LuTextCursor } from "react-icons/lu";
import { IoTextSharp } from "react-icons/io5";
import { FaStarHalfStroke, FaTrash } from "react-icons/fa6";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

import { Alert } from '@heroui/alert';
import { RxCrossCircled } from "react-icons/rx";
import { CiCircleCheck } from "react-icons/ci";

import InputField from './FormComponents/InputField';
import TextAreaField from './FormComponents/TextAreaField';
import StarRatingField from './FormComponents/DropdownField';
import RadioField from './FormComponents/RadioField';
import EmailField from './FormComponents/EmailField';
import { useUserStore } from '../../utils/userstore';

const fieldOptions = [
  { type: 'input', label: 'Input Field', icon: <LuTextCursor className="inline mr-2" /> },
  { type: 'textarea', label: 'Textarea', icon: <IoTextSharp className="inline mr-2" /> },
  { type: 'rating', label: 'Star Rating', icon: <FaStarHalfStroke className="inline mr-2" /> },
  { type: 'radio', label: 'Radio Options', icon: <IoMdRadioButtonOn className="inline mr-2" /> },
  { type: 'email', label: 'Email Field', icon: <MdOutlineMail className="inline mr-2" /> },
];

const stepVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const fieldCardVariants = {
  initial: { opacity: 0, y: 8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.98 },
};

export default function SimpleFormBuilder() {
  const [step, setStep] = useState(1);
  const [formName, setFormName] = useState('');
  const [fields, setFields] = useState([]);
  const [showFieldMenu, setShowFieldMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [alert, setAlert] = useState({ show: false, title: '', description: '', color: 'success' });

  const darkMode = useThemeStore((s) => s.darkMode);
  const user = useUserStore((s) => s.user);
  const uid = user?.userId || null;

  const contentControls = useAnimation();

  const updateOptions = (id, newOptions) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, options: newOptions } : f)));
  };
  const addField = (fieldType) => {
    const selected = fieldOptions.find((f) => f.type === fieldType);
    let newField = { ...selected, id: Date.now().toString(), label: '' };
    if (fieldType === 'radio') newField.options = ['Option 1', 'Option 2'];
    if (fieldType === 'rating') newField.options = ['1', '2', '3', '4', '5'];
    if (fieldType === 'email') newField.label = 'Email';
    setFields((prev) => [...prev, newField]);
    setShowFieldMenu(false);
    contentControls.start({ scale: [1, 1.01, 1], transition: { duration: 0.28 } });
  };

  const updateLabel = (id, newLabel) => setFields((prev) => prev.map((f) => (f.id === id ? { ...f, label: newLabel } : f)));
  const removeField = (id) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    contentControls.start({ scale: [1, 0.995, 1], transition: { duration: 0.2 } });
  };

  const handleSaveForm = async () => {
    if (!formName.trim()) {
      setAlert({ show: true, title: 'Missing name', description: 'Enter the form name first', color: 'danger' });
      return;
    }
    if (fields.length === 0) {
      setAlert({ show: true, title: 'No fields', description: 'Please add at least one field before saving.', color: 'danger' });
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}api/forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, uid, fields }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.statusText}`);

      setAlert({ show: true, title: 'Form created successfully', description: 'Your form is ready — go to the Forms tab to view it.', color: 'success' });
    setTimeout(() => {
    setAlert(prev => ({ ...prev, show: false }));
    window.location.reload();
  }, 2000);
    } catch (e) {
      console.error(e);
      setAlert({ show: true, title: 'Save failed', description: 'Failed to save form.', color: 'danger' });
    } finally {
      setIsSaving(false);
    }
  };

  const canGoNextFrom1 = formName.trim().length > 0;
  const canGoNextFrom2 = fields.length > 0;
  const next = () => {
    if (step === 1 && !canGoNextFrom1) return;
    if (step === 2 && !canGoNextFrom2) return;
    const newStep = Math.min(3, step + 1);
    setStep(newStep);
    contentControls.start({ opacity: [0, 1], y: [8, 0], transition: { duration: 0.25 } });
  };
  const back = () => {
    const newStep = Math.max(1, step - 1);
    setStep(newStep);
    contentControls.start({ opacity: [0, 1], y: [8, 0], transition: { duration: 0.25 } });
  };

  const renderField = (f) => {
    const common = { label: f.label, onLabelChange: (val) => updateLabel(f.id, val) };
    switch (f.type) {
      case 'input': return <InputField {...common} />;
      case 'textarea': return <TextAreaField {...common} />;
      case 'rating': return <StarRatingField {...common} options={f.options} />;
      case 'radio':
        return (
          <RadioField
            {...common}
            options={f.options || []}
            onOptionsChange={(opts) => updateOptions(f.id, opts)}
          />
        );
      case 'email': return <EmailField {...common} />;
      default: return null;
    }
  };
  const container = `max-w-4xl mx-auto p-6 min-h-screen transition-colors duration-300 ${darkMode ? ' text-gray-100' : 'text-gray-900'}`;
  const card = `rounded-2xl transition-colors duration-300 ${darkMode ? 'bg-transparent' : 'bg-transparent'}`;

  const StepDot = ({ title, active, done, index }) => {
    return (
      <div className="flex items-center gap-3">
        <motion.div
          layout
          initial={{ scale: 1 }}
          animate={done ? { scale: 1.18, backgroundColor: '#10B981' } : active ? { scale: 1.08, backgroundColor: undefined } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          className={[
            'w-3 h-3 rounded-full flex-shrink-0',
            done ? 'bg-emerald-500' : active ? 'bg-[var(--blue)]' : (darkMode ? 'bg-white/10' : 'bg-gray-300'),
          ].join(' ')}
        />
        <div className={`text-sm ${active ? 'font-semibold' : 'opacity-80'}`}>{title}</div>
      </div>
    );
  };

  const connectorProgress = (() => {
    if (step === 1) return 0;
    if (step === 2) return 0.5;
    return 1;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.32 }}
      className={container}
    >
      <div className="mb-4">
      <AnimatePresence>
  {alert.show && (
    <motion.div
      initial={{ opacity: 0, x: 120 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 120 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-6 right-6 z-50"
    >
      <Alert
        variant="solid"
        className={`flex items-start gap-3 w-[28rem] rounded-xl p-5 shadow-2xl transition-colors
          ${darkMode
            ? alert.color === 'danger'
              ? 'bg-[#2c1a1a] text-red-300'
              : 'bg-[#2e2c2c] text-emerald-100'
            : alert.color === 'danger'
              ? 'bg-red-50 text-red-800'
              : 'bg-emerald-50 text-emerald-800'}
        `}
      >
        <div className="flex items-start gap-3">
          {alert.color === 'danger' ? (
            <RxCrossCircled className="text-2xl flex-shrink-0 text-red-500 dark:text-red-400" />
          ) : (
            <CiCircleCheck className="text-2xl flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          )}
          <div>
            <h4 className="font-semibold text-base mb-1">
              {alert.title}
            </h4>
            <p className="text-sm opacity-90">{alert.description}</p>
          </div>
        </div>
      </Alert>
    </motion.div>
  )}
</AnimatePresence>
      </div>

      {/* Timeline: Name -> Form -> Create (minimal, no bg/border) */}
      <div className={`${card} p-3 mb-6`}>
        <div className="flex items-center gap-4">
          <StepDot title="Name" active={step === 1} done={step > 1} index={1} />

          {/* connector: background + animated filled overlay */}
          <div className="relative flex-1 h-[4px] rounded-full mx-3 bg-gray-200/60 dark:bg-white/8 overflow-hidden">
            <motion.div
              style={{ position: 'absolute', left: 0, top: 0, bottom: 0 }}
              initial={{ width: `${connectorProgress * 100}%` }}
              animate={{ width: `${connectorProgress * 100}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="bg-[var(--blue)] dark:bg-[var(--lightblue)]"
            />
          </div>

          <StepDot title="Form" active={step === 2} done={step > 2} index={2} />

          <div className="relative flex-1 h-[4px] rounded-full mx-3 bg-gray-200/60 dark:bg-white/8 overflow-hidden">
            {/* second segment fills as step reaches 3 */}
            <motion.div
              style={{ position: 'absolute', left: 0, top: 0, bottom: 0 }}
              initial={{ width: `${Math.max(0, (connectorProgress - 0.5) * 2) * 100}%` }}
              animate={{ width: `${Math.max(0, (connectorProgress - 0.5) * 2) * 100}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="bg-[var(--blue)] dark:bg-[var(--lightblue)]"
            />
          </div>

          <StepDot title="Create" active={step === 3} done={false} index={3} />
        </div>
      </div>

      {/* Steps area: animate between steps; contentControls pulses when fields add/remove */}
      <div>
        <AnimatePresence mode="wait" initial={false}>
          {step === 1 && (
            <motion.section
              key="step-1"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.22 }}
              className={`${card} p-6`}
            >
              <motion.div animate={contentControls}>
                <label className="block text-sm font-medium mb-2">Form Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter form name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className={`p-3 rounded w-full border outline-none ${darkMode ? 'text-gray-100 border-gray-700 placeholder-gray-400 bg-[#111214]' : 'text-gray-900 border-gray-300 placeholder-gray-500 bg-white'}`}
                  />
                  <motion.button
                    onClick={next}
                    disabled={!canGoNextFrom1}
                    whileTap={{ scale: canGoNextFrom1 ? 0.97 : 1 }}
                    whileHover={canGoNextFrom1 ? { scale: 1.02 } : {}}
                    className={`px-4 py-2 rounded font-bold flex items-center gap-2 ${canGoNextFrom1 ? (darkMode ? 'bg-[var(--lightblue)] text-black hover:bg-[var(--blue)]' : 'bg-[var(--blue)] text-white hover:bg-[var(--lightblue)]') : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                  >
                    Next <FiChevronRight />
                  </motion.button>
                </div>
              </motion.div>
            </motion.section>
          )}

          {step === 2 && (
            <motion.section
              key="step-2"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.22 }}
              className={`${card} p-6`}
            >
              <motion.div animate={contentControls}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm opacity-80">Building: <span className="font-semibold">{formName || 'Untitled form'}</span></div>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={back}
                      whileTap={{ scale: 0.97 }}
                      className={`px-3 py-2 rounded border flex items-center gap-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                    >
                      <FiChevronLeft /> Back
                    </motion.button>
                    <motion.button
                      onClick={() => setStep(3)}
                      disabled={!canGoNextFrom2}
                      whileTap={{ scale: canGoNextFrom2 ? 0.97 : 1 }}
                      whileHover={canGoNextFrom2 ? { scale: 1.02 } : {}}
                      className={`px-3 py-2 rounded font-semibold flex items-center gap-2 ${canGoNextFrom2 ? (darkMode ? 'bg-[var(--lightblue)] text-black hover:bg-[var(--blue)]' : 'bg-[var(--blue)] text-white hover:bg-[var(--lightblue)]') : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                    >
                      Create
                    </motion.button>
                  </div>
                </div>

                {/* Canvas */}
                <div className={`p-5 rounded-xl min-h-[260px] ${darkMode ? 'bg-[#111214]' : 'bg-gray-50'}`}>
                  {fields.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-16 text-gray-400"
                    >
                      ✨ No fields added yet
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {fields.map((field) => (
                          <motion.div
                            key={field.id}
                            layout
                            variants={fieldCardVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                            className={`p-4 rounded-lg flex items-start justify-between border ${darkMode ? 'border-gray-700 bg-[var(--darker)]' : 'border-gray-200 bg-white'}`}
                          >
                            <div className="flex-1">{renderField(field)}</div>
                            <motion.button
                              type="button"
                              onClick={() => removeField(field.id)}
                              whileTap={{ scale: 0.95 }}
                              className="ml-4 text-rose-500 hover:opacity-80 transition"
                              title="Remove field"
                            >
                              <FaTrash />
                            </motion.button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Add field menu */}
                <div className="mt-4 relative">
                  <motion.button
                    onClick={() => setShowFieldMenu((s) => !s)}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow ${darkMode ? 'text-black bg-[var(--lightblue)] hover:bg-[var(--blue)]' : 'text-white bg-[var(--blue)] hover:bg-[var(--lightblue)]'}`}
                  >
                    Add Field {showFieldMenu ? <RiArrowDropUpLine className="text-2xl" /> : <RiArrowDropDownLine className="text-2xl" />}
                  </motion.button>

                  {showFieldMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute mt-2 rounded-lg shadow-lg p-2 z-10 w-56 border ${darkMode ? 'bg-[#18191A] border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}
                    >
                      {fieldOptions.map((f) => (
                        <div
                          key={f.type}
                          onClick={() => addField(f.type)}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          {f.icon} {f.label}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.section>
          )}

          {step === 3 && (
            <motion.section
              key="step-3"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.22 }}
              className={`${card} p-6`}
            >
              <motion.div animate={contentControls}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Create</h3>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={back}
                      whileTap={{ scale: 0.97 }}
                      className={`px-3 py-2 rounded border flex items-center gap-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                    >
                      <FiChevronLeft /> Back
                    </motion.button>
                    <motion.button
                      onClick={handleSaveForm}
                      disabled={isSaving}
                      whileTap={{ scale: isSaving ? 1 : 0.98 }}
                      whileHover={isSaving ? {} : { scale: 1.02 }}
                      className={`px-4 py-2 rounded font-bold flex items-center gap-2 ${isSaving ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : (darkMode ? 'bg-[var(--lightblue)] text-black hover:bg-[var(--blue)]' : 'bg-[var(--blue)] text-white hover:bg-[var(--lightblue)]')}`}
                    >
                      {isSaving ? 'Creating...' : 'Create'}
                      {!isSaving && <FiCheck />}
                    </motion.button>
                  </div>
                </div>

                {/* compact hint only (no preview) */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-4 rounded-lg ${darkMode ? 'bg-[#111214]' : 'bg-gray-50'}`}>
                  <div className="text-sm opacity-80">Once created, your form will appear under the <strong>Forms</strong> tab.</div>
                  <div className="text-xs opacity-70 mt-2">Make sure you've added all fields before creating.</div>
                </motion.div>
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
