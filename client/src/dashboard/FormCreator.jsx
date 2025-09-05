'use client';
import { FiPlus } from 'react-icons/fi';
import { useThemeStore } from '../utils/themestore';
import toast from 'react-hot-toast';

export default function FormCreator({ formName, setFormName, handleCreateForm }) {
  const darkMode = useThemeStore((state) => state.darkMode);
  const handleClick = () => {
    if (!formName.trim()) {
      toast.error("Enter the form name first ");
      return;
    }
    handleCreateForm();
  };

  return (
    <div className="mb-10 max-w-6xl mx-auto p-6  ">
      <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
        Create New Form
      </h2>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter form name"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          className={`p-2 rounded w-full border transition-colors duration-200
            ${darkMode
              ? ' text-gray-100 border-gray-600 placeholder-gray-400'
              : 'text-gray-900 border-gray-700 placeholder-gray-500'}
          `}
        />

        <button
          onClick={handleClick}
          className={`flex items-center gap-2 px-4 py-2 rounded font-bold transition
            ${darkMode
              ? 'bg-[var(--lightblue)] text-gray-900 hover:bg-[var(--blue)]'
              : 'bg-[var(--blue)] text-white hover:bg-[var(--lightblue)]'}
          `}
        >
          Create
          <FiPlus className="text-lg" />
        </button>
      </div>
    </div>
  );
}
