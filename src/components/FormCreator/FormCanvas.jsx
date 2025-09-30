

import { useState } from 'react';
import { useThemeStore } from '../../utils/themestore';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import { MdOutlineMail } from "react-icons/md";
import { IoMdRadioButtonOn } from "react-icons/io";
import { LuTextCursor } from "react-icons/lu";
import { IoTextSharp } from "react-icons/io5";
import { FaStarHalfStroke, FaTrash } from "react-icons/fa6";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";

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

export default function SimpleFormBuilder() {
  const [formName, setFormName] = useState('');
  const [fields, setFields] = useState([]);
  const [showFieldMenu, setShowFieldMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
const user = useUserStore((state) => state.user);
console.log(user,"okoko")
 const uid = user?.userId || null
  const darkMode = useThemeStore((state) => state.darkMode);
const updateOptions = (id, newOptions) => {
  setFields((prev) =>
    prev.map((field) =>
      field.id === id ? { ...field, options: newOptions } : field
    )
  );
  console.log(`🔄 Updated options for ${id}:`, newOptions);
};

const addField = (fieldType) => {
  const selected = fieldOptions.find((f) => f.type === fieldType);

  let newField = { 
    ...selected, 
    id: Date.now().toString(), 
    label: '' 
  };

  if (fieldType === 'radio') {
    newField.options = ['Option 1', 'Option 2'];  
  }
  if (fieldType === 'rating') {
    newField.options = ['1', '2', '3', '4', '5']; 
  }

  setFields((prev) => [...prev, newField]);
  console.log("🆕 Field added:", newField);
  setShowFieldMenu(false);
};

  const updateLabel = (id, newLabel) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, label: newLabel } : field
      )
    );
  };

  const removeField = (id) => {
    setFields((prev) => prev.filter((field) => field.id !== id));
  };

  const handleSaveForm = async () => {
    if (!formName.trim()) {
      toast.error("Enter the form name first");
      return;
    }
    if (fields.length === 0) {
      toast.error("Please add at least one field before saving.");
      return;
    }

    try {
      setIsSaving(true);
      const formData = { name: formName, uid, fields };

      const res = await fetch(`${import.meta.env.VITE_BASE_URL}api/forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error(`Server error: ${res.statusText}`);
      toast.success("✅ Your form is ready! Returning to dashboard...");
      window.location.reload();
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error("Failed to save form.");
    } finally {
      setIsSaving(false);
    }
  };
  const renderField = (field) => {
  const commonProps = {
    label: field.label,
    onLabelChange: (val) => updateLabel(field.id, val),
  };

  switch (field.type) {
    case 'input': return <InputField {...commonProps} />;
    case 'textarea': return <TextAreaField {...commonProps} />;
    case 'rating': return <StarRatingField {...commonProps} options={field.options} />;
    case 'radio': return (
      <RadioField
        {...commonProps}
        options={field.options || []}
        onOptionsChange={(opts) => updateOptions(field.id, opts)}
      />
    );
    case 'email': return <EmailField {...commonProps} />;
    default: return null;
  }
};



  return (
    <div className={`max-w-6xl mx-auto p-6  p-6 min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#101210] text-gray-100' : ' text-gray-900'}`}>
      
      <div className="mb-6 ">
        <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Form Name
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter form name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            className={`p-2 rounded w-full border transition-colors duration-200 ${
              darkMode
                ? 'text-gray-100 border-gray-600 placeholder-gray-400 bg-[#18191A]'
                : 'text-gray-900 border-gray-400 placeholder-gray-500 bg-white'
            }`}
          />
          <button
            onClick={handleSaveForm}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded font-bold transition ${
              isSaving
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : darkMode
                ? 'bg-[var(--lightblue)] text-gray-900 hover:bg-[var(--blue)]'
                : 'bg-[var(--blue)] text-white hover:bg-[var(--lightblue)]'
            }`}
          >
            {isSaving ? 'Saving...' : 'Save'}
            <FiPlus className="text-lg" />
          </button>
        </div>
      </div>

      {/* --- Form Canvas --- */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className={`p-6 rounded-2xl shadow min-h-[300px] transition-colors duration-300 ${
          darkMode ? 'bg-[#18191A]' : 'bg-white'
        }`}
      >
        {fields.length === 0 ? (
          <p className="text-gray-400 text-center">✨ No fields added yet</p>
        ) : (
          fields.map((field) => (
            <div
              key={field.id}
              className={`mb-6 p-4 rounded-lg flex items-start justify-between transition-colors ${
                darkMode
                  ? 'border-gray-700 bg-[var(--darker)] hover:border-[var(--lightblue)]'
                  : 'border-gray-200 bg-gray-100 hover:border-[var(--lightblue)]'
              }`}
            >
              <div className="flex-1">{renderField(field)}</div>
              <button
                type="button"
                onClick={() => removeField(field.id)}
                className="ml-4 text-[var(--blue)] hover:text-red-300 transition"
              >
                <FaTrash />
              </button>
            </div>
          ))
        )}
      </form>

      <div className="flex gap-4 mt-6">
        <div className="relative">
          <button
            onClick={() => setShowFieldMenu(!showFieldMenu)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold shadow transition-colors ${
              darkMode
                ? 'text-black hover:bg-[var(--blue)] bg-[var(--lightblue)]'
                : 'text-white hover:bg-[var(--lightblue)] bg-[var(--blue)]'
            }`}
          >
            Add Field
            {showFieldMenu ? <RiArrowDropUpLine className="text-2xl" /> : <RiArrowDropDownLine className="text-2xl" />}
          </button>

          {showFieldMenu && (
            <div
              className={`absolute mt-2 rounded-lg shadow-lg p-2 z-10 w-56 border transition ${
                darkMode
                  ? 'bg-[#18191A] border-gray-700 text-gray-100'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              {fieldOptions.map((field) => (
                <div
                  key={field.type}
                  onClick={() => addField(field.type)}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition ${
                    darkMode
                      ? 'hover:bg-gray-700 hover:text-[var(--lightblue)]'
                      : 'hover:bg-gray-100 hover:text-[var(--lightblue)]'
                  }`}
                >
                  {field.icon}
                  {field.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
