'use client';

import { FiLogOut } from 'react-icons/fi';
import { FaArrowTrendUp } from "react-icons/fa6";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { signOut } from 'next-auth/react';
import { useThemeStore } from '../utils/themestore';

export default function Header({ user }) {
  const darkMode = useThemeStore((state) => state.darkMode);
  const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode);

  return (
    <div className="flex justify-between items-center gap-4 mb-6 pb-4">
      <div className="text-lg font-bold">
        {user?.name ? `Hello ${user.name} 👋` : 'Welcome!'}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => window.location.href = '/admin'}
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
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2 font-bold hover:text-[#9ACD32] transition"
        >
          Logout
          <FiLogOut className="text-lg" />
        </button>
      </div>
    </div>
  );
}
