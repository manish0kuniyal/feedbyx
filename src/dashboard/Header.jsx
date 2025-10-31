'use client';

import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { FaArrowTrendUp } from "react-icons/fa6";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import axios from 'axios';
import { useThemeStore } from '../utils/themestore';
import { useNavigate } from 'react-router-dom';

export default function Header({ user, setUser, sidebarOpen, toggleSidebar }) {
  const darkMode = useThemeStore((state) => state.darkMode);
  const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}api/auth/logout`, {}, { withCredentials: true });
      setUser(null);             
      window.location.href = '/'; 
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="flex justify-between items-center gap-4 mb-6 pb-4">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {sidebarOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
        </button>
        <div className="text-lg font-bold">
          {user?.name ? `Hello ${user.name} 👋` : 'Welcome!'}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin')}
          className="flex p-1 px-2 rounded bg-[#9ACD32] items-center gap-2 font-bold hover:text-gray-200 transition"
        >
          Dashboard
          <FaArrowTrendUp className="text-lg" />
        </button>

        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-2 font-bold hover:text-[#9ACD32] transition"
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
          {darkMode ? <MdLightMode className="text-lg" /> : <MdDarkMode className="text-lg" />}
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 font-bold hover:text-[#9ACD32] transition"
        >
          Logout
          <FiLogOut className="text-lg" />
        </button>
      </div>
    </div>
  );
}
